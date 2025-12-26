"""
Appointment views.
"""

from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.middleware import RateLimitMiddleware
from apps.services.models import Service
from apps.users.models import User
from .models import Appointment, WeeklyAvailability, ExceptionDate
from .serializers import (
    BookingRequestSerializer,
    AppointmentListSerializer,
    AppointmentDetailSerializer,
    AppointmentAdminSerializer,
    AppointmentActionSerializer,
    AvailableSlotsSerializer,
    TimeSlotSerializer,
    WeeklyAvailabilitySerializer,
    ExceptionDateSerializer,
)
from .availability import AvailabilityEngine, get_available_dates
from .tasks import send_booking_confirmation, send_appointment_approved


class AvailableSlotsView(APIView):
    """Get available booking slots."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        serializer = AvailableSlotsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Single-clinic mode - doctor_id is optional
        engine = AvailabilityEngine()
        slots = engine.get_available_slots(
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            modality=data.get('modality')
        )
        
        # Group slots by date
        grouped_slots = {}
        for slot in slots:
            date_str = slot.date.isoformat()
            if date_str not in grouped_slots:
                grouped_slots[date_str] = []
            grouped_slots[date_str].append({
                'start_time': slot.start_time.strftime('%H:%M'),
                'end_time': slot.end_time.strftime('%H:%M'),
                'modality': slot.modality,
            })
        
        return Response({
            'success': True,
            'data': {
                'slots': grouped_slots,
                'total_slots': len(slots)
            }
        })


class AvailableDatesView(APIView):
    """Get dates that have available slots."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Single-clinic mode - no doctor_id needed
        days = int(request.query_params.get('days', 30))
        
        engine = AvailabilityEngine()
        today = timezone.now().date()
        start_date = today + timedelta(days=1)
        end_date = today + timedelta(days=days)
        
        slots = engine.get_available_slots(start_date, end_date)
        available_dates = sorted(set(slot.date for slot in slots))
        
        return Response({
            'success': True,
            'data': {
                'dates': [d.isoformat() for d in available_dates]
            }
        })


class BookAppointmentView(APIView):
    """
    Book a new appointment (Guest Checkout).
    Rate limited and includes honeypot detection.
    """
    permission_classes = [AllowAny]
    throttle_scope = 'booking'
    
    @transaction.atomic
    def post(self, request):
        # Additional email-based rate limiting
        email = request.data.get('patient_details', {}).get('email', '')
        if email and not RateLimitMiddleware.check_email_rate_limit(email, limit=5):
            return Response({
                'success': False,
                'error': {
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'message': 'Too many booking attempts. Please try again later.'
                }
            }, status=429)
        
        serializer = BookingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Lock and verify slot availability (single-clinic mode)
        engine = AvailabilityEngine()
        if not engine.lock_slot(data['scheduled_date'], data['scheduled_time'], data['modality']):
            return Response({
                'success': False,
                'error': {
                    'code': 'SLOT_UNAVAILABLE',
                    'message': 'This time slot is no longer available. Please select another time.'
                }
            }, status=409)
        
        # Get service if provided
        service = None
        if data.get('service_id'):
            service = get_object_or_404(Service, id=data['service_id'])
        
        # Create appointment (single-clinic mode - no doctor assignment)
        appointment = Appointment.objects.create(
            service=service,
            patient_type=data['patient_type'],
            patient_details=data['patient_details'],
            scheduled_date=data['scheduled_date'],
            scheduled_time=data['scheduled_time'],
            duration_minutes=service.duration_minutes if service else 30,
            modality=data['modality'],
            timezone=data.get('timezone', 'UTC'),
            reason=data.get('reason', ''),
            status=Appointment.Status.PENDING,
        )
        
        # Trigger confirmation email (async)
        send_booking_confirmation.delay(appointment.id)
        
        return Response({
            'success': True,
            'data': {
                'reference_id': appointment.reference_id,
                'message': 'Your appointment request has been submitted. You will receive a confirmation email shortly.',
                'appointment': AppointmentDetailSerializer(appointment).data
            }
        }, status=201)


class AppointmentLookupView(APIView):
    """Look up appointment by reference ID (for guests)."""
    permission_classes = [AllowAny]
    
    def get(self, request, reference_id):
        appointment = get_object_or_404(Appointment, reference_id=reference_id.upper())
        
        return Response({
            'success': True,
            'data': AppointmentDetailSerializer(appointment).data
        })


class CancelAppointmentView(APIView):
    """Cancel an appointment by reference ID."""
    permission_classes = [AllowAny]
    
    def post(self, request, reference_id):
        appointment = get_object_or_404(Appointment, reference_id=reference_id.upper())
        
        if not appointment.can_cancel:
            return Response({
                'success': False,
                'error': {
                    'code': 'CANNOT_CANCEL',
                    'message': 'This appointment cannot be cancelled.'
                }
            }, status=400)
        
        reason = request.data.get('reason', 'Cancelled by patient')
        appointment.cancel(reason)
        
        return Response({
            'success': True,
            'message': 'Appointment cancelled successfully.'
        })


# Admin Views
class AppointmentAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for appointment management."""
    serializer_class = AppointmentAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'scheduled_date', 'modality']
    
    def get_queryset(self):
        queryset = Appointment.objects.all().select_related('service')
        
        # Filter by status groups
        status_group = self.request.query_params.get('status_group')
        if status_group == 'pending':
            queryset = queryset.filter(status=Appointment.Status.PENDING)
        elif status_group == 'upcoming':
            queryset = queryset.filter(
                status=Appointment.Status.APPROVED,
                scheduled_date__gte=timezone.now().date()
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def action(self, request, pk=None):
        """Perform actions on appointment (approve/reject/cancel/complete)."""
        appointment = self.get_object()
        serializer = AppointmentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action_type = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')
        meeting_link = serializer.validated_data.get('meeting_link', '')
        
        if action_type == 'approve':
            appointment.approve(meeting_link)
            # Trigger approval email
            send_appointment_approved.delay(appointment.id)
            message = 'Appointment approved successfully.'
        
        elif action_type == 'reject':
            appointment.reject(reason)
            # Trigger rejection email
            from .tasks import send_appointment_rejected
            send_appointment_rejected.delay(appointment.id, reason)
            message = 'Appointment rejected.'
        
        elif action_type == 'cancel':
            appointment.cancel(reason)
            message = 'Appointment cancelled.'
        
        elif action_type == 'complete':
            appointment.complete()
            message = 'Appointment marked as completed.'
        
        return Response({
            'success': True,
            'message': message,
            'data': AppointmentAdminSerializer(appointment).data
        })


class WeeklyAvailabilityViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing weekly availability."""
    serializer_class = WeeklyAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return WeeklyAvailability.objects.all()


class ExceptionDateViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing exception dates."""
    serializer_class = ExceptionDateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'exception_type']
    
    def get_queryset(self):
        return ExceptionDate.objects.all()
