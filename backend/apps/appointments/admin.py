from django.contrib import admin
from .models import Appointment, WeeklyAvailability, ExceptionDate


@admin.register(WeeklyAvailability)
class WeeklyAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    ordering = ['day_of_week', 'start_time']


@admin.register(ExceptionDate)
class ExceptionDateAdmin(admin.ModelAdmin):
    list_display = ['date', 'exception_type', 'reason']
    list_filter = ['exception_type']
    date_hierarchy = 'date'
    ordering = ['date']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'reference_id', 'patient_name', 'scheduled_date',
        'scheduled_time', 'status', 'modality'
    ]
    list_filter = ['status', 'modality', 'scheduled_date']
    search_fields = ['reference_id', 'patient_details__name', 'patient_details__email']
    readonly_fields = ['reference_id', 'created_at', 'updated_at']
    date_hierarchy = 'scheduled_date'
    ordering = ['-scheduled_date', '-scheduled_time']
    
    fieldsets = (
        ('Reference', {'fields': ('reference_id', 'status')}),
        ('Patient', {'fields': ('patient_details', 'patient_type')}),
        ('Scheduling', {'fields': ('service', 'scheduled_date', 'scheduled_time', 'duration_minutes', 'modality', 'timezone')}),
        ('Details', {'fields': ('reason', 'notes', 'meeting_link')}),
        ('Notifications', {'fields': ('confirmation_sent', 'reminder_sent')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def patient_name(self, obj):
        return obj.patient_name
    patient_name.short_description = 'Patient'
