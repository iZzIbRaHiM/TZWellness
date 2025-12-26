"""
Appointment signals for automatic actions.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from .models import Appointment

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Appointment)
def appointment_status_changed(sender, instance, created, **kwargs):
    """Handle appointment status changes and log activity."""
    from apps.core.models import ActivityLog
    
    if created:
        logger.info(f"New appointment created: {instance.reference_id}")
        # Log new appointment creation
        ActivityLog.log(
            action_type=ActivityLog.ActionType.APPOINTMENT_CREATED,
            description=f"New appointment request from {instance.patient_name}",
            metadata={
                'reference_id': instance.reference_id,
                'patient_email': instance.patient_email,
                'service': instance.service.title if instance.service else 'General',
                'modality': instance.modality,
                'scheduled_date': instance.scheduled_date.isoformat(),
            },
            related_object=instance
        )
    else:
        logger.info(f"Appointment {instance.reference_id} updated to status: {instance.status}")
