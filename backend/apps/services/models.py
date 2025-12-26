"""
Service models for medical clinic services.
"""

from django.db import models
from django.utils.text import slugify
from apps.core.models import TimeStampedModel, PublishableModel, SEOModel


class ServiceCategory(TimeStampedModel):
    """Category for grouping services."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class name (e.g., 'heart', 'brain')")
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Service(TimeStampedModel, PublishableModel, SEOModel):
    """
    Medical service model.
    Each service represents a type of consultation or treatment offered.
    """
    
    class Modality(models.TextChoices):
        IN_PERSON = 'in_person', 'In-Person'
        VIRTUAL = 'virtual', 'Virtual'
        BOTH = 'both', 'Both Available'
    
    # Basic Info
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='services'
    )
    
    # Content
    short_description = models.CharField(max_length=300, help_text="Brief description for cards")
    description = models.TextField(help_text="Full description of the service")
    symptoms = models.TextField(blank=True, help_text="Common symptoms this service addresses")
    approach = models.TextField(blank=True, help_text="Our approach to treatment")
    what_to_expect = models.TextField(blank=True, help_text="What patients can expect")
    
    # Media
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    
    # Booking Details
    modality = models.CharField(max_length=20, choices=Modality.choices, default=Modality.BOTH)
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_note = models.CharField(max_length=100, blank=True, help_text="e.g., 'Starting from' or 'Per session'")
    
    # Display
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['order', 'title']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ServiceFAQ(TimeStampedModel):
    """FAQ items for a service."""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Service FAQ'
        verbose_name_plural = 'Service FAQs'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.service.title} - {self.question[:50]}"


class Testimonial(TimeStampedModel, PublishableModel):
    """Patient testimonials."""
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonials'
    )
    patient_name = models.CharField(max_length=100)
    patient_location = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5, help_text="Rating out of 5")
    date = models.DateField()
    is_verified = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.patient_name} - {self.rating} stars"
