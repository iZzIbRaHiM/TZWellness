"""
Dashboard API views for Admin Panel.
Provides real-time statistics and activity feeds.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
import logging

from apps.appointments.models import Appointment
from apps.core.models import ActivityLog

logger = logging.getLogger(__name__)


class DashboardSummaryView(APIView):
    """
    GET /api/v1/dashboard/summary/
    
    Returns real-time dashboard statistics:
    - Pending appointments count
    - Today's appointments count
    - Total unique patients
    - Completion rate
    - Weekly trends
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Core stats - real SQL aggregation
        pending_count = Appointment.objects.filter(
            status=Appointment.Status.PENDING
        ).count()
        
        today_count = Appointment.objects.filter(
            scheduled_date=today,
            status__in=[Appointment.Status.PENDING, Appointment.Status.APPROVED]
        ).count()
        
        # Total unique patients (by email)
        total_patients = Appointment.objects.values(
            'patient_details__email'
        ).distinct().count()
        
        # More accurate patient count using raw query for JSON field
        all_appointments = Appointment.objects.all()
        unique_emails = set()
        for apt in all_appointments:
            email = apt.patient_details.get('email', '')
            if email:
                unique_emails.add(email.lower())
        total_patients = len(unique_emails)
        
        # Completion rate calculation
        completed_count = Appointment.objects.filter(
            status=Appointment.Status.COMPLETED
        ).count()
        
        total_non_pending = Appointment.objects.exclude(
            status=Appointment.Status.PENDING
        ).count()
        
        completion_rate = 0
        if total_non_pending > 0:
            completion_rate = round((completed_count / total_non_pending) * 100, 1)
        
        # Weekly comparison for trends
        this_week_count = Appointment.objects.filter(
            created_at__date__gte=week_ago
        ).count()
        
        last_week_start = week_ago - timedelta(days=7)
        last_week_count = Appointment.objects.filter(
            created_at__date__gte=last_week_start,
            created_at__date__lt=week_ago
        ).count()
        
        # Calculate percentage change
        if last_week_count > 0:
            weekly_change = round(((this_week_count - last_week_count) / last_week_count) * 100, 1)
        else:
            weekly_change = 100 if this_week_count > 0 else 0
        
        # Appointments by status breakdown
        status_breakdown = Appointment.objects.values('status').annotate(
            count=Count('id')
        )
        status_dict = {item['status']: item['count'] for item in status_breakdown}
        
        # Upcoming appointments (next 7 days)
        upcoming_count = Appointment.objects.filter(
            status=Appointment.Status.APPROVED,
            scheduled_date__gte=today,
            scheduled_date__lte=today + timedelta(days=7)
        ).count()
        
        # Monthly appointments chart data
        monthly_data = Appointment.objects.filter(
            created_at__date__gte=month_ago
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return Response({
            'success': True,
            'data': {
                'stats': {
                    'pending_appointments': pending_count,
                    'today_appointments': today_count,
                    'total_patients': total_patients,
                    'completion_rate': completion_rate,
                    'upcoming_appointments': upcoming_count,
                    'weekly_change': weekly_change,
                },
                'status_breakdown': {
                    'pending': status_dict.get('pending', 0),
                    'approved': status_dict.get('approved', 0),
                    'completed': status_dict.get('completed', 0),
                    'cancelled': status_dict.get('cancelled', 0),
                    'rejected': status_dict.get('rejected', 0),
                    'no_show': status_dict.get('no_show', 0),
                },
                'chart_data': list(monthly_data),
            }
        })


class PendingAppointmentsView(APIView):
    """
    GET /api/v1/dashboard/pending/
    
    Returns list of pending appointments for admin approval.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        pending = Appointment.objects.filter(
            status=Appointment.Status.PENDING
        ).select_related('service').order_by('-created_at')[:20]
        
        appointments_data = []
        for apt in pending:
            appointments_data.append({
                'id': apt.id,
                'reference_id': apt.reference_id,
                'patient_name': apt.patient_name,
                'patient_email': apt.patient_email,
                'patient_phone': apt.patient_phone,
                'service': apt.service.title if apt.service else 'General Consultation',
                'service_id': apt.service.id if apt.service else None,
                'scheduled_date': apt.scheduled_date.isoformat(),
                'scheduled_time': apt.scheduled_time.strftime('%H:%M'),
                'modality': apt.modality,
                'modality_display': apt.get_modality_display(),
                'patient_type': apt.patient_type,
                'patient_type_display': apt.get_patient_type_display(),
                'reason': apt.reason,
                'created_at': apt.created_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'data': {
                'appointments': appointments_data,
                'count': len(appointments_data),
                'total_pending': Appointment.objects.filter(
                    status=Appointment.Status.PENDING
                ).count()
            }
        })


class RecentActivityView(APIView):
    """
    GET /api/v1/dashboard/activity/
    
    Returns recent activity feed for dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        
        activities = ActivityLog.objects.select_related('actor').order_by(
            '-created_at'
        )[:limit]
        
        activity_data = []
        for activity in activities:
            activity_data.append({
                'id': activity.id,
                'action_type': activity.action_type,
                'action_display': activity.get_action_type_display(),
                'description': activity.description,
                'actor_name': activity.actor.full_name if activity.actor else 'System',
                'actor_id': activity.actor.id if activity.actor else None,
                'metadata': activity.metadata,
                'created_at': activity.created_at.isoformat(),
                'time_ago': self._get_time_ago(activity.created_at),
            })
        
        return Response({
            'success': True,
            'data': {
                'activities': activity_data,
                'count': len(activity_data)
            }
        })
    
    def _get_time_ago(self, dt):
        """Convert datetime to human-readable time ago string."""
        now = timezone.now()
        diff = now - dt
        
        if diff.days > 0:
            if diff.days == 1:
                return '1 day ago'
            return f'{diff.days} days ago'
        
        hours = diff.seconds // 3600
        if hours > 0:
            if hours == 1:
                return '1 hour ago'
            return f'{hours} hours ago'
        
        minutes = diff.seconds // 60
        if minutes > 0:
            if minutes == 1:
                return '1 minute ago'
            return f'{minutes} minutes ago'
        
        return 'Just now'


class ApproveAppointmentView(APIView):
    """
    POST /api/v1/dashboard/appointments/{id}/approve/
    
    Approve a pending appointment.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, pk):
        from apps.appointments.tasks import send_appointment_approved
        
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Appointment not found'}
            }, status=404)
        
        if appointment.status != Appointment.Status.PENDING:
            return Response({
                'success': False,
                'error': {'message': 'Only pending appointments can be approved'}
            }, status=400)
        
        meeting_link = request.data.get('meeting_link', '')
        appointment.approve(meeting_link)
        
        # Log activity
        ActivityLog.log(
            action_type=ActivityLog.ActionType.APPOINTMENT_APPROVED,
            description=f"Appointment confirmed for {appointment.patient_name}",
            actor=request.user if request.user.is_authenticated else None,
            metadata={
                'reference_id': appointment.reference_id,
                'patient_email': appointment.patient_email,
                'scheduled_date': appointment.scheduled_date.isoformat(),
            },
            related_object=appointment
        )
        
        # Trigger email (async via Celery)
        try:
            send_appointment_approved.delay(appointment.id)
        except Exception as e:
            # Log but don't fail if Celery is not running
            logger.error(
                f"Failed to trigger approval email for appointment {appointment.reference_id}: {e}. "
                f"Email task not sent. Admin should manually send confirmation to {appointment.patient_email}."
            )
            logger.info(
                f"MANUAL ACTION REQUIRED: Send approval email to {appointment.patient_email} "
                f"for appointment {appointment.reference_id} on {appointment.scheduled_date}."
            )
        
        return Response({
            'success': True,
            'message': 'Appointment approved successfully',
            'data': {
                'id': appointment.id,
                'reference_id': appointment.reference_id,
                'status': appointment.status,
            }
        })


class RejectAppointmentView(APIView):
    """
    POST /api/v1/dashboard/appointments/{id}/reject/
    
    Reject a pending appointment with reason.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, pk):
        from apps.appointments.tasks import send_appointment_rejected
        
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Appointment not found'}
            }, status=404)
        
        if appointment.status != Appointment.Status.PENDING:
            return Response({
                'success': False,
                'error': {'message': 'Only pending appointments can be rejected'}
            }, status=400)
        
        reason = request.data.get('reason', 'No reason provided')
        appointment.reject(reason)
        
        # Log activity
        ActivityLog.log(
            action_type=ActivityLog.ActionType.APPOINTMENT_REJECTED,
            description=f"Appointment rejected for {appointment.patient_name}",
            actor=request.user if request.user.is_authenticated else None,
            metadata={
                'reference_id': appointment.reference_id,
                'reason': reason,
            },
            related_object=appointment
        )
        
        # Trigger rejection email (async via Celery)
        try:
            send_appointment_rejected.delay(appointment.id, reason)
        except Exception as e:
            # Log but don't fail if Celery is not running
            logger.error(
                f"Failed to trigger rejection email for appointment {appointment.reference_id}: {e}. "
                f"Email task not sent. Admin should manually send rejection notice to {appointment.patient_email}."
            )
            logger.info(
                f"MANUAL ACTION REQUIRED: Send rejection email to {appointment.patient_email} "
                f"for appointment {appointment.reference_id}. Reason: {reason}"
            )
        
        return Response({
            'success': True,
            'message': 'Appointment rejected',
            'data': {
                'id': appointment.id,
                'reference_id': appointment.reference_id,
                'status': appointment.status,
            }
        })


class TodayAppointmentsView(APIView):
    """
    GET /api/v1/dashboard/today/
    
    Returns today's scheduled appointments.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        today = timezone.now().date()
        
        appointments = Appointment.objects.filter(
            scheduled_date=today,
            status__in=[Appointment.Status.APPROVED, Appointment.Status.PENDING]
        ).select_related('service').order_by('scheduled_time')
        
        appointments_data = []
        for apt in appointments:
            appointments_data.append({
                'id': apt.id,
                'reference_id': apt.reference_id,
                'patient_name': apt.patient_name,
                'service': apt.service.title if apt.service else 'General Consultation',
                'scheduled_time': apt.scheduled_time.strftime('%H:%M'),
                'modality': apt.modality,
                'status': apt.status,
                'status_display': apt.get_status_display(),
            })
        
        return Response({
            'success': True,
            'data': {
                'appointments': appointments_data,
                'count': len(appointments_data),
                'date': today.isoformat()
            }
        })
