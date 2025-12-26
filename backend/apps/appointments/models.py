"""
Appointment models for the booking engine.
Hardened models with proper constraints and atomic operations.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_reference_id


class WeeklyAvailability(TimeStampedModel):
    """
    Weekly recurring availability slots.
    Defines when appointments can be booked.
    """
    
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'
    
    # No longer using doctor field - admin manages all appointments
    # Kept for backward compatibility, will be removed in future migration
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    # Modality-specific availability
    allows_virtual = models.BooleanField(default=True)
    allows_in_person = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Weekly Availability'
        verbose_name_plural = 'Weekly Availabilities'
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class ExceptionDate(TimeStampedModel):
    """
    Exception dates for unavailability (holidays, vacations, etc.)
    """
    
    class ExceptionType(models.TextChoices):
        BLOCKED = 'blocked', 'Blocked (No Appointments)'
        MODIFIED = 'modified', 'Modified Hours'
    
    # No longer using doctor field - admin manages all exceptions
    # Kept for backward compatibility, will be removed in future migration
    date = models.DateField()
    exception_type = models.CharField(
        max_length=20,
        choices=ExceptionType.choices,
        default=ExceptionType.BLOCKED
    )
    reason = models.CharField(max_length=200, blank=True)
    
    # For modified hours only
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Exception Date'
        verbose_name_plural = 'Exception Dates'
        ordering = ['date']
    
    def __str__(self):
        return f"{self.date} ({self.get_exception_type_display()})"


class Appointment(TimeStampedModel):
    """
    Main appointment model.
    Stores all booking information with guest checkout support.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = 'no_show', 'No Show'
    
    class Modality(models.TextChoices):
        VIRTUAL = 'virtual', 'Virtual'
        IN_PERSON = 'in_person', 'In-Person'
        PHONE = 'phone', 'Phone Call'
    
    class PatientType(models.TextChoices):
        NEW = 'new', 'New Patient'
        RETURNING = 'returning', 'Returning Patient'
        DISCOVERY = 'discovery', 'Discovery Call'
    
    # Public Reference
    reference_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        editable=False
    )
    
    # Status & Workflow
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    
    # Scheduling - No doctor field needed, admin manages all appointments
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        null=True,
        related_name='appointments'
    )
    scheduled_date = models.DateField(db_index=True)
    scheduled_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Modality
    modality = models.CharField(
        max_length=20,
        choices=Modality.choices,
        default=Modality.VIRTUAL
    )
    patient_type = models.CharField(
        max_length=20,
        choices=PatientType.choices,
        default=PatientType.NEW
    )
    
    # Guest Patient Details (No Login Required)
    patient_details = models.JSONField(
        default=dict,
        help_text="Patient info: name, email, phone"
    )
    
    # Additional Notes
    reason = models.TextField(blank=True, help_text="Reason for visit")
    notes = models.TextField(blank=True, help_text="Internal notes (admin only)")
    
    # Notifications
    confirmation_sent = models.BooleanField(default=False)
    reminder_sent = models.BooleanField(default=False)
    
    # Meeting Details (for virtual)
    meeting_link = models.URLField(blank=True)
    
    class Meta:
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        ordering = ['-scheduled_date', '-scheduled_time']
        indexes = [
            models.Index(fields=['scheduled_date', 'scheduled_time']),
            models.Index(fields=['status', 'scheduled_date']),
            models.Index(fields=['reference_id']),
        ]
    
    def __str__(self):
        return f"{self.reference_id} - {self.patient_name} on {self.scheduled_date}"
    
    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = self._generate_unique_reference_id()
        super().save(*args, **kwargs)
    
    def _generate_unique_reference_id(self):
        """Generate a unique reference ID."""
        for _ in range(10):  # Max 10 attempts
            ref_id = generate_reference_id()
            if not Appointment.objects.filter(reference_id=ref_id).exists():
                return ref_id
        raise ValueError("Could not generate unique reference ID")
    
    @property
    def patient_name(self):
        return self.patient_details.get('name', 'Unknown')
    
    @property
    def patient_email(self):
        return self.patient_details.get('email', '')
    
    @property
    def patient_phone(self):
        return self.patient_details.get('phone', '')
    
    @property
    def scheduled_datetime(self):
        """Combine date and time into a datetime object."""
        from datetime import datetime
        return datetime.combine(self.scheduled_date, self.scheduled_time)
    
    @property
    def is_upcoming(self):
        """Check if appointment is in the future."""
        from datetime import datetime
        now = timezone.now()
        scheduled = timezone.make_aware(
            datetime.combine(self.scheduled_date, self.scheduled_time)
        )
        return scheduled > now
    
    @property
    def can_cancel(self):
        """Check if appointment can be cancelled (24 hours before)."""
        if self.status in [self.Status.COMPLETED, self.Status.CANCELLED, self.Status.NO_SHOW]:
            return False
        return self.is_upcoming
    
    def approve(self, meeting_link=''):
        """Approve the appointment."""
        self.status = self.Status.APPROVED
        if meeting_link:
            self.meeting_link = meeting_link
        self.save(update_fields=['status', 'meeting_link', 'updated_at'])
    
    def reject(self, reason=''):
        """Reject the appointment."""
        self.status = self.Status.REJECTED
        if reason:
            self.notes = f"Rejected: {reason}\n{self.notes}"
        self.save(update_fields=['status', 'notes', 'updated_at'])
    
    def cancel(self, reason=''):
        """Cancel the appointment."""
        self.status = self.Status.CANCELLED
        if reason:
            self.notes = f"Cancelled: {reason}\n{self.notes}"
        self.save(update_fields=['status', 'notes', 'updated_at'])
    
    def complete(self):
        """Mark appointment as completed."""
        self.status = self.Status.COMPLETED
        self.save(update_fields=['status', 'updated_at'])
