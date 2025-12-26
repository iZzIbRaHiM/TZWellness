"""
Celery configuration for TF Wellfare.
Handles async tasks for email dispatch & heavy logic.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('tf_wellfare')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'cleanup-expired-pending-appointments': {
        'task': 'apps.appointments.tasks.cleanup_expired_pending',
        'schedule': 3600.0,  # Every hour
    },
    'send-appointment-reminders': {
        'task': 'apps.appointments.tasks.send_appointment_reminders',
        'schedule': 3600.0,  # Every hour
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery connectivity."""
    pass  # Used only for Celery health checks
