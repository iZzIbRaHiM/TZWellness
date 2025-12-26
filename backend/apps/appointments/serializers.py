"""
Appointment serializers.
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta

from apps.core.serializers import HoneypotMixin
from apps.services.serializers import ServiceListSerializer
from .models import Appointment, WeeklyAvailability, ExceptionDate
from .availability import AvailabilityEngine


class PatientDetailsSerializer(serializers.Serializer):
    """Serializer for guest patient details."""
    name = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)


class BookingRequestSerializer(HoneypotMixin, serializers.Serializer):
    """
    Serializer for booking requests (guest checkout).
    Includes honeypot field for bot detection.
    Single-clinic mode: doctor_id is optional.
    """
    # Patient Info
    patient_type = serializers.ChoiceField(choices=Appointment.PatientType.choices)
    patient_details = PatientDetailsSerializer()
    
    # Appointment Details
    service_id = serializers.IntegerField(required=False, allow_null=True)
    doctor_id = serializers.IntegerField(required=False, allow_null=True)  # Optional in single-clinic mode
    scheduled_date = serializers.DateField()
    scheduled_time = serializers.TimeField()
    modality = serializers.ChoiceField(choices=Appointment.Modality.choices)
    timezone = serializers.CharField(max_length=50, default='UTC')
    reason = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    def validate_timezone(self, value):
        """Validate timezone is valid."""
        import pytz
        if value not in pytz.all_timezones:
            # Allow common timezone formats
            common_timezones = ['UTC', 'GMT', 'EST', 'PST', 'CST', 'MST']
            if value not in common_timezones:
                # Try to be lenient - just return UTC if invalid
                return 'UTC'
        return value
    
    def validate_scheduled_date(self, value):
        """Validate that date is within allowed range."""
        today = timezone.now().date()
        min_date = today + timedelta(days=1)
        max_date = today + timedelta(days=60)
        
        if value < min_date:
            raise serializers.ValidationError("Appointments must be booked at least 1 day in advance")
        if value > max_date:
            raise serializers.ValidationError("Appointments cannot be booked more than 60 days in advance")
        
        return value
    
    def validate(self, data):
        """Validate slot availability."""
        scheduled_date = data.get('scheduled_date')
        scheduled_time = data.get('scheduled_time')
        modality = data.get('modality')
        
        # Single-clinic mode - no doctor_id required
        engine = AvailabilityEngine()
        
        if not engine.is_slot_available(scheduled_date, scheduled_time, modality):
            raise serializers.ValidationError({
                'scheduled_time': 'This time slot is no longer available. Please select another time.'
            })
        
        return data


class AppointmentListSerializer(serializers.ModelSerializer):
    """Serializer for appointment list view."""
    patient_name = serializers.CharField(read_only=True)
    patient_email = serializers.CharField(read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    modality_display = serializers.CharField(source='get_modality_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'reference_id', 'status', 'status_display',
            'patient_name', 'patient_email', 'patient_type',
            'service', 'service_title',
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'modality', 'modality_display', 'created_at'
        ]


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Serializer for appointment detail view."""
    patient_name = serializers.CharField(read_only=True)
    patient_email = serializers.CharField(read_only=True)
    patient_phone = serializers.CharField(read_only=True)
    service = ServiceListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    modality_display = serializers.CharField(source='get_modality_display', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'reference_id', 'status', 'status_display',
            'patient_details', 'patient_name', 'patient_email', 'patient_phone',
            'patient_type', 'service',
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'modality', 'modality_display', 'timezone', 'reason',
            'meeting_link', 'is_upcoming', 'can_cancel',
            'confirmation_sent', 'reminder_sent',
            'created_at', 'updated_at'
        ]


class AppointmentAdminSerializer(serializers.ModelSerializer):
    """Admin serializer with all fields and actions."""
    patient_name = serializers.CharField(read_only=True)
    patient_email = serializers.CharField(read_only=True)
    patient_phone = serializers.CharField(read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['reference_id', 'created_at', 'updated_at']


class AppointmentActionSerializer(serializers.Serializer):
    """Serializer for appointment actions (approve/reject/cancel)."""
    action = serializers.ChoiceField(choices=['approve', 'reject', 'cancel', 'complete'])
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    meeting_link = serializers.URLField(required=False, allow_blank=True)


class AvailableSlotsSerializer(serializers.Serializer):
    """Serializer for available slots request."""
    doctor_id = serializers.IntegerField(required=False)  # Optional in single-clinic mode
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    modality = serializers.ChoiceField(
        choices=['virtual', 'in_person'],
        required=False
    )


class TimeSlotSerializer(serializers.Serializer):
    """Serializer for time slot response."""
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    modality = serializers.ListField(child=serializers.CharField())


class WeeklyAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for weekly availability."""
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = WeeklyAvailability
        fields = [
            'id', 'day_of_week', 'day_name',
            'start_time', 'end_time', 'is_active',
            'allows_virtual', 'allows_in_person'
        ]


class ExceptionDateSerializer(serializers.ModelSerializer):
    """Serializer for exception dates."""
    type_display = serializers.CharField(source='get_exception_type_display', read_only=True)
    
    class Meta:
        model = ExceptionDate
        fields = [
            'id', 'date', 'exception_type', 'type_display',
            'reason', 'start_time', 'end_time'
        ]


class BookingConfirmationSerializer(serializers.Serializer):
    """Serializer for booking confirmation response."""
    success = serializers.BooleanField()
    reference_id = serializers.CharField()
    message = serializers.CharField()
    appointment = AppointmentDetailSerializer()
