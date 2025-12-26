"""
Celery tasks for event notifications.
"""

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_event_registration_confirmation(self, registration_id):
    """Send event registration confirmation email."""
    try:
        from .models import EventRegistration
        registration = EventRegistration.objects.select_related('event').get(id=registration_id)
        
        subject = f"Event Registration Confirmed - {settings.CLINIC_NAME}"
        
        message = f"""
Dear {registration.name},

Thank you for registering for our event!

Event Details:
- Title: {registration.event.title}
- Date: {registration.event.start_datetime.strftime('%B %d, %Y')}
- Time: {registration.event.start_datetime.strftime('%I:%M %p')} - {registration.event.end_datetime.strftime('%I:%M %p')}
- Type: {registration.event.get_modality_display()}
- Confirmation Code: {registration.confirmation_code}

{f'Join Link: {registration.event.meeting_link}' if registration.event.meeting_link else f'Location: {registration.event.location}'}

We look forward to seeing you there!

If you have any questions, please contact us at {settings.CLINIC_PHONE} or {settings.CLINIC_EMAIL}.

Best regards,
{settings.CLINIC_NAME}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.email],
            fail_silently=False,
        )
        
        logger.info(f"Event registration confirmation sent for {registration.confirmation_code}")
        
    except Exception as e:
        logger.error(f"Failed to send event registration confirmation: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task
def send_event_reminders():
    """Send reminder emails for events tomorrow."""
    from .models import EventRegistration, Event
    from django.utils import timezone
    
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Get events happening tomorrow
    events = Event.objects.filter(
        start_datetime__date=tomorrow,
        status='upcoming'
    )
    
    for event in events:
        registrations = EventRegistration.objects.filter(
            event=event,
            reminder_sent=False
        )
        
        for registration in registrations:
            try:
                subject = f"Reminder: {event.title} Tomorrow - {settings.CLINIC_NAME}"
                
                message = f"""
Dear {registration.name},

This is a reminder that you're registered for the following event tomorrow:

Event: {event.title}
Date: {event.start_datetime.strftime('%B %d, %Y')}
Time: {event.start_datetime.strftime('%I:%M %p')}
Type: {event.get_modality_display()}

{f'Join Link: {event.meeting_link}' if event.meeting_link else f'Location: {event.location}'}

Your Confirmation Code: {registration.confirmation_code}

We look forward to seeing you!

Best regards,
{settings.CLINIC_NAME}
                """
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[registration.email],
                    fail_silently=False,
                )
                
                registration.reminder_sent = True
                registration.save(update_fields=['reminder_sent'])
                
                logger.info(f"Event reminder sent for {registration.confirmation_code}")
                
            except Exception as e:
                logger.error(f"Failed to send event reminder for {registration.confirmation_code}: {e}")
