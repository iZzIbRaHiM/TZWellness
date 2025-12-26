"""
Event views.
"""

from rest_framework import viewsets, generics, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Event, EventCategory, EventRegistration
from .serializers import (
    EventListSerializer,
    EventDetailSerializer,
    EventCategorySerializer,
    EventRegistrationSerializer,
    EventAdminSerializer,
    CalendarEventSerializer,
)


class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for event categories."""
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for public events.
    Supports calendar view and list view with filters.
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'status', 'modality', 'is_featured']
    search_fields = ['title', 'description']
    ordering_fields = ['start_datetime', 'title']
    
    def get_queryset(self):
        queryset = Event.objects.filter(is_published=True).select_related('category', 'host')
        
        # Filter for upcoming events by default
        show_past = self.request.query_params.get('show_past', 'false').lower() == 'true'
        if not show_past:
            queryset = queryset.filter(start_datetime__gte=timezone.now())
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        if self.action == 'calendar':
            return CalendarEventSerializer
        return EventListSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events."""
        events = self.get_queryset().filter(
            status=Event.Status.UPCOMING,
            start_datetime__gte=timezone.now()
        ).order_by('start_datetime')[:10]
        
        serializer = EventListSerializer(events, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get events for calendar view."""
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        
        queryset = self.get_queryset()
        
        if start:
            queryset = queryset.filter(start_datetime__gte=start)
        if end:
            queryset = queryset.filter(end_datetime__lte=end)
        
        serializer = CalendarEventSerializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def register(self, request, slug=None):
        """Register for an event."""
        event = self.get_object()
        
        data = request.data.copy()
        data['event'] = event.id
        
        serializer = EventRegistrationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        registration = serializer.save()
        
        # Send confirmation email via Celery
        from .tasks import send_event_registration_confirmation
        send_event_registration_confirmation.delay(registration.id)
        
        return Response({
            'success': True,
            'data': {
                'confirmation_code': registration.confirmation_code,
                'message': 'Successfully registered for the event. Check your email for confirmation.'
            }
        }, status=status.HTTP_201_CREATED)


# Admin Views
class EventAdminViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for event CRUD."""
    queryset = Event.objects.all().select_related('category', 'host')
    serializer_class = EventAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'status', 'is_published']
    search_fields = ['title', 'description']
    
    def perform_create(self, serializer):
        serializer.save(host=self.request.user)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, slug=None):
        """Get registrations for an event."""
        event = self.get_object()
        registrations = event.registrations.all()
        
        data = [{
            'id': r.id,
            'name': r.name,
            'email': r.email,
            'phone': r.phone,
            'confirmation_code': r.confirmation_code,
            'is_confirmed': r.is_confirmed,
            'attended': r.attended,
            'registered_at': r.created_at,
        } for r in registrations]
        
        return Response({
            'success': True,
            'data': data,
            'total': len(data)
        })
