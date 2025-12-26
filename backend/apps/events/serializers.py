"""
Event serializers.
"""

from rest_framework import serializers
from .models import Event, EventCategory, EventRegistration


class EventCategorySerializer(serializers.ModelSerializer):
    """Serializer for event categories."""
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'slug', 'event_type', 'description', 'color', 'icon', 'event_count']
    
    def get_event_count(self, obj):
        return obj.events.filter(is_published=True, status='upcoming').count()


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for event list view."""
    category = EventCategorySerializer(read_only=True)
    host_name = serializers.CharField(source='host.full_name', read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    spots_left = serializers.IntegerField(read_only=True)
    can_register = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'image',
            'category', 'host_name',
            'start_datetime', 'end_datetime', 'timezone',
            'modality', 'location',
            'is_free', 'price',
            'max_attendees', 'current_attendees', 'spots_left',
            'is_full', 'can_register',
            'status', 'is_featured'
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    """Serializer for event detail view."""
    category = EventCategorySerializer(read_only=True)
    host_name = serializers.CharField(source='host.full_name', read_only=True)
    host_bio = serializers.CharField(source='host.bio', read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    spots_left = serializers.IntegerField(read_only=True)
    can_register = serializers.BooleanField(read_only=True)
    schema_markup = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'description', 'what_to_expect',
            'image', 'video_url',
            'category', 'host_name', 'host_bio',
            'start_datetime', 'end_datetime', 'timezone',
            'modality', 'location', 'meeting_link',
            'is_free', 'price',
            'max_attendees', 'current_attendees', 'spots_left',
            'is_full', 'can_register', 'registration_deadline',
            'status', 'is_featured',
            'meta_title', 'meta_description',
            'schema_markup',
            'created_at', 'updated_at'
        ]
    
    def get_schema_markup(self, obj):
        return obj.get_schema_markup()


class EventRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for event registration."""
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'name', 'email', 'phone', 'confirmation_code', 'is_confirmed']
        read_only_fields = ['confirmation_code', 'is_confirmed']
    
    def validate_event(self, event):
        if not event.can_register:
            if event.is_full:
                raise serializers.ValidationError("This event is fully booked.")
            if not event.is_upcoming:
                raise serializers.ValidationError("Registration is closed for this event.")
        return event
    
    def validate(self, data):
        # Check for duplicate registration
        if EventRegistration.objects.filter(
            event=data['event'],
            email=data['email']
        ).exists():
            raise serializers.ValidationError({
                'email': 'You are already registered for this event.'
            })
        return data


class EventAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for event CRUD."""
    
    class Meta:
        model = Event
        fields = '__all__'


class CalendarEventSerializer(serializers.ModelSerializer):
    """Serializer for calendar view (minimal data)."""
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'slug', 'start_datetime', 'end_datetime', 'status', 'modality']
