"""
Event models for workshops, talks, and Q&A sessions.
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from apps.core.models import TimeStampedModel, PublishableModel, SEOModel


class EventCategory(TimeStampedModel):
    """Category for events."""
    
    class EventType(models.TextChoices):
        WORKSHOP = 'workshop', 'Workshop'
        LIVE_QA = 'live_qa', 'Live Q&A'
        SUPPORT_GROUP = 'support_group', 'Support Group'
        WEBINAR = 'webinar', 'Webinar'
        SEMINAR = 'seminar', 'Seminar'
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.WORKSHOP)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#064E3B')
    icon = models.CharField(max_length=50, blank=True)
    
    class Meta:
        verbose_name = 'Event Category'
        verbose_name_plural = 'Event Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Event(TimeStampedModel, PublishableModel, SEOModel):
    """
    Event model for workshops, talks, and support groups.
    Implements Event schema markup for Google.
    """
    
    class Modality(models.TextChoices):
        VIRTUAL = 'virtual', 'Virtual'
        IN_PERSON = 'in_person', 'In-Person'
        HYBRID = 'hybrid', 'Hybrid'
    
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        ONGOING = 'ongoing', 'Ongoing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    # Basic Info
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(
        EventCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events'
    )
    
    # Content
    short_description = models.CharField(max_length=300)
    description = models.TextField()
    what_to_expect = models.TextField(blank=True)
    
    # Media
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    video_url = models.URLField(blank=True, help_text="YouTube/Vimeo URL for recordings")
    
    # Scheduling
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Location
    modality = models.CharField(max_length=20, choices=Modality.choices, default=Modality.VIRTUAL)
    location = models.CharField(max_length=300, blank=True, help_text="Physical address or online platform")
    meeting_link = models.URLField(blank=True)
    
    # Capacity
    max_attendees = models.PositiveIntegerField(null=True, blank=True)
    current_attendees = models.PositiveIntegerField(default=0)
    
    # Pricing
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Host
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='hosted_events'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    is_featured = models.BooleanField(default=False)
    
    # Registration
    registration_required = models.BooleanField(default=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['start_datetime']
        indexes = [
            models.Index(fields=['start_datetime', 'status']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-update status based on dates
        now = timezone.now()
        if self.start_datetime <= now < self.end_datetime:
            self.status = self.Status.ONGOING
        elif self.end_datetime <= now:
            self.status = self.Status.COMPLETED
        
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        return self.start_datetime > timezone.now()
    
    @property
    def is_full(self):
        if self.max_attendees:
            return self.current_attendees >= self.max_attendees
        return False
    
    @property
    def spots_left(self):
        if self.max_attendees:
            return max(0, self.max_attendees - self.current_attendees)
        return None
    
    @property
    def can_register(self):
        if not self.registration_required:
            return False
        if self.is_full:
            return False
        if self.registration_deadline and timezone.now() > self.registration_deadline:
            return False
        return self.is_upcoming
    
    def get_schema_markup(self):
        """Generate JSON-LD schema markup for the event."""
        schema = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": self.title,
            "description": self.short_description,
            "startDate": self.start_datetime.isoformat(),
            "endDate": self.end_datetime.isoformat(),
            "eventStatus": f"https://schema.org/Event{self.status.capitalize()}",
            "eventAttendanceMode": self._get_attendance_mode(),
            "organizer": {
                "@type": "Organization",
                "name": settings.CLINIC_NAME,
                "url": settings.SITE_URL if hasattr(settings, 'SITE_URL') else ""
            }
        }
        
        if self.location:
            schema["location"] = {
                "@type": "Place" if self.modality != 'virtual' else "VirtualLocation",
                "name": self.location,
                "url": self.meeting_link if self.modality == 'virtual' else ""
            }
        
        if self.image:
            schema["image"] = self.image.url
        
        if not self.is_free and self.price:
            schema["offers"] = {
                "@type": "Offer",
                "price": str(self.price),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock" if self.can_register else "https://schema.org/SoldOut"
            }
        
        return schema
    
    def _get_attendance_mode(self):
        modes = {
            'virtual': 'https://schema.org/OnlineEventAttendanceMode',
            'in_person': 'https://schema.org/OfflineEventAttendanceMode',
            'hybrid': 'https://schema.org/MixedEventAttendanceMode',
        }
        return modes.get(self.modality, modes['virtual'])


class EventRegistration(TimeStampedModel):
    """Registration for events."""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    
    # Guest registration (no login required)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Confirmation
    confirmation_code = models.CharField(max_length=20, unique=True)
    is_confirmed = models.BooleanField(default=False)
    attended = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
        unique_together = ['event', 'email']
    
    def __str__(self):
        return f"{self.name} - {self.event.title}"
    
    def save(self, *args, **kwargs):
        if not self.confirmation_code:
            from apps.core.utils import generate_reference_id
            self.confirmation_code = generate_reference_id(8)
        
        # Increment event attendee count on new registration
        if not self.pk:
            Event.objects.filter(pk=self.event_id).update(
                current_attendees=models.F('current_attendees') + 1
            )
        
        super().save(*args, **kwargs)
