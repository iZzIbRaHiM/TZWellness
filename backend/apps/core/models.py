"""
Base models with common fields and functionality.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class TimeStampedModel(models.Model):
    """
    Abstract base model with created and updated timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """
    Abstract base model with UUID primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True


class PublishableModel(models.Model):
    """
    Abstract base model for content that can be published/unpublished.
    """
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def publish(self):
        self.is_published = True
        self.published_at = timezone.now()
        self.save(update_fields=['is_published', 'published_at'])
    
    def unpublish(self):
        self.is_published = False
        self.save(update_fields=['is_published'])


class SEOModel(models.Model):
    """
    Abstract base model with SEO fields.
    """
    meta_title = models.CharField(max_length=70, blank=True, help_text="SEO title (max 70 chars)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO description (max 160 chars)")
    meta_keywords = models.CharField(max_length=255, blank=True, help_text="Comma-separated keywords")
    
    class Meta:
        abstract = True
    
    def get_meta_title(self):
        return self.meta_title or getattr(self, 'title', '')
    
    def get_meta_description(self):
        return self.meta_description or getattr(self, 'excerpt', '')[:160]


class ActivityLog(TimeStampedModel):
    """
    Activity log for tracking admin actions and system events.
    Powers the Recent Activity feed on the Admin Dashboard.
    """
    
    class ActionType(models.TextChoices):
        APPOINTMENT_CREATED = 'appointment_created', 'Appointment Created'
        APPOINTMENT_APPROVED = 'appointment_approved', 'Appointment Approved'
        APPOINTMENT_REJECTED = 'appointment_rejected', 'Appointment Rejected'
        APPOINTMENT_CANCELLED = 'appointment_cancelled', 'Appointment Cancelled'
        APPOINTMENT_COMPLETED = 'appointment_completed', 'Appointment Completed'
        BLOG_PUBLISHED = 'blog_published', 'Blog Post Published'
        BLOG_UPDATED = 'blog_updated', 'Blog Post Updated'
        EVENT_CREATED = 'event_created', 'Event Created'
        EVENT_UPDATED = 'event_updated', 'Event Updated'
        USER_LOGIN = 'user_login', 'User Login'
        USER_LOGOUT = 'user_logout', 'User Logout'
    
    action_type = models.CharField(
        max_length=50, 
        choices=ActionType.choices,
        db_index=True
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    description = models.CharField(max_length=500)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Generic foreign key-like fields for related objects
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()}: {self.description}"
    
    @classmethod
    def log(cls, action_type, description, actor=None, metadata=None, related_object=None):
        """
        Helper method to create an activity log entry.
        """
        log_entry = cls(
            action_type=action_type,
            description=description,
            actor=actor,
            metadata=metadata or {}
        )
        
        if related_object:
            log_entry.related_object_type = related_object.__class__.__name__
            log_entry.related_object_id = related_object.pk
        
        log_entry.save()
        return log_entry
