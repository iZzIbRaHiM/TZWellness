"""
Celery tasks for appointment notifications.
"""

from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from icalendar import Calendar, Event
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_booking_confirmation(self, appointment_id):
    """Send booking confirmation email to patient."""
    try:
        from .models import Appointment
        appointment = Appointment.objects.select_related('service').get(id=appointment_id)
        
        subject = f"Booking Request Received - {settings.CLINIC_NAME}"
        
        context = {
            'appointment': appointment,
            'clinic_name': settings.CLINIC_NAME,
            'clinic_phone': settings.CLINIC_PHONE,
            'clinic_email': settings.CLINIC_EMAIL,
        }
        
        # Plain text version
        message = f"""
Dear {appointment.patient_name},

Thank you for booking with {settings.CLINIC_NAME}.

Your appointment request has been received and is pending approval.

Appointment Details:
- Reference ID: {appointment.reference_id}
- Date: {appointment.scheduled_date.strftime('%B %d, %Y')}
- Time: {appointment.scheduled_time.strftime('%I:%M %p')}
- Type: {appointment.get_modality_display()}
{f'- Service: {appointment.service.title}' if appointment.service else ''}

You will receive a confirmation email once your appointment is approved.

If you have any questions, please contact us at {settings.CLINIC_PHONE} or {settings.CLINIC_EMAIL}.

Best regards,
{settings.CLINIC_NAME}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            fail_silently=False,
        )
        
        # Mark as sent
        appointment.confirmation_sent = True
        appointment.save(update_fields=['confirmation_sent'])
        
        logger.info(f"Confirmation email sent for appointment {appointment.reference_id}")
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_appointment_approved(self, appointment_id):
    """Send approval email with calendar invite."""
    try:
        from .models import Appointment
        appointment = Appointment.objects.select_related('service').get(id=appointment_id)
        
        subject = f"Appointment Confirmed - {settings.CLINIC_NAME}"
        
        # Create ICS calendar invite
        cal = Calendar()
        cal.add('prodid', '-//TF Wellfare//Appointment//')
        cal.add('version', '2.0')
        cal.add('method', 'REQUEST')
        
        event = Event()
        event.add('summary', f"Medical Appointment - {settings.CLINIC_NAME}")
        
        # Combine date and time
        start_dt = datetime.combine(appointment.scheduled_date, appointment.scheduled_time)
        end_dt = start_dt + timedelta(minutes=appointment.duration_minutes)
        
        event.add('dtstart', start_dt)
        event.add('dtend', end_dt)
        event.add('uid', f"{appointment.reference_id}@tfwellfare.com")
        
        description = f"""
Appointment Reference: {appointment.reference_id}
Type: {appointment.get_modality_display()}
{f'Service: {appointment.service.title}' if appointment.service else ''}

{f'Meeting Link: {appointment.meeting_link}' if appointment.meeting_link else f'Location: {settings.CLINIC_ADDRESS}'}

Contact: {settings.CLINIC_PHONE}
        """
        event.add('description', description)
        
        if appointment.modality == 'virtual' and appointment.meeting_link:
            event.add('location', appointment.meeting_link)
        else:
            event.add('location', settings.CLINIC_ADDRESS)
        
        cal.add_component(event)
        
        message = f"""
Dear {appointment.patient_name},

Great news! Your appointment has been confirmed.

Appointment Details:
- Reference ID: {appointment.reference_id}
- Date: {appointment.scheduled_date.strftime('%B %d, %Y')}
- Time: {appointment.scheduled_time.strftime('%I:%M %p')}
- Duration: {appointment.duration_minutes} minutes
- Type: {appointment.get_modality_display()}
{f'- Service: {appointment.service.title}' if appointment.service else ''}

{f'Join via: {appointment.meeting_link}' if appointment.meeting_link else f'Location: {settings.CLINIC_ADDRESS}'}

Please arrive 10 minutes early for your appointment.

If you need to reschedule or cancel, please do so at least 24 hours in advance.

Best regards,
{settings.CLINIC_NAME}
{settings.CLINIC_PHONE}
        """
        
        from django.core.mail import EmailMessage
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[appointment.patient_email],
        )
        
        # Attach ICS file
        email.attach('appointment.ics', cal.to_ical(), 'text/calendar')
        email.send(fail_silently=False)
        
        logger.info(f"Approval email sent for appointment {appointment.reference_id}")
        
    except Exception as e:
        logger.error(f"Failed to send approval email: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_appointment_rejected(self, appointment_id, reason=''):
    """Send rejection email asking patient to reschedule."""
    try:
        from .models import Appointment
        appointment = Appointment.objects.select_related('service').get(id=appointment_id)
        
        subject = f"Appointment Reschedule Request - {settings.CLINIC_NAME}"
        
        message = f"""
Dear {appointment.patient_name},

We regret to inform you that your appointment request for {appointment.scheduled_date.strftime('%B %d, %Y')} at {appointment.scheduled_time.strftime('%I:%M %p')} could not be confirmed.

Appointment Details:
- Reference ID: {appointment.reference_id}
{f'- Service: {appointment.service.title}' if appointment.service else ''}

{f'Reason: {reason}' if reason else ''}

We apologize for any inconvenience. Please visit our website to book a new appointment at a different time, or contact us directly at {settings.CLINIC_PHONE} and we'll help you find an alternative slot.

Best regards,
{settings.CLINIC_NAME}
{settings.CLINIC_PHONE}
{settings.CLINIC_EMAIL}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            fail_silently=False,
        )
        
        logger.info(f"Rejection email sent for appointment {appointment.reference_id}")
        
    except Exception as e:
        logger.error(f"Failed to send rejection email: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task
def send_appointment_reminders():
    """Send reminder emails for appointments tomorrow."""
    from .models import Appointment
    from django.utils import timezone
    
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    appointments = Appointment.objects.filter(
        scheduled_date=tomorrow,
        status=Appointment.Status.APPROVED,
        reminder_sent=False
    ).select_related('service')
    
    for appointment in appointments:
        try:
            subject = f"Reminder: Your Appointment Tomorrow - {settings.CLINIC_NAME}"
            
            message = f"""
Dear {appointment.patient_name},

This is a reminder that you have an appointment tomorrow.

Appointment Details:
- Date: {appointment.scheduled_date.strftime('%B %d, %Y')}
- Time: {appointment.scheduled_time.strftime('%I:%M %p')}
- Type: {appointment.get_modality_display()}
{f'- Service: {appointment.service.title}' if appointment.service else ''}

{f'Join via: {appointment.meeting_link}' if appointment.meeting_link else f'Location: {settings.CLINIC_ADDRESS}'}

If you need to reschedule, please contact us as soon as possible.

Best regards,
{settings.CLINIC_NAME}
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient_email],
                fail_silently=False,
            )
            
            appointment.reminder_sent = True
            appointment.save(update_fields=['reminder_sent'])
            
            logger.info(f"Reminder sent for appointment {appointment.reference_id}")
            
        except Exception as e:
            logger.error(f"Failed to send reminder for {appointment.reference_id}: {e}")


@shared_task
def cleanup_expired_pending():
    """Clean up pending appointments that are past their scheduled date."""
    from .models import Appointment
    from django.utils import timezone
    
    yesterday = timezone.now().date() - timedelta(days=1)
    
    expired = Appointment.objects.filter(
        status=Appointment.Status.PENDING,
        scheduled_date__lt=yesterday
    )
    
    count = expired.count()
    expired.update(status=Appointment.Status.CANCELLED)
    
    if count:
        logger.info(f"Cancelled {count} expired pending appointments")
