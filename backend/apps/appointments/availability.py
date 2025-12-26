"""
Availability Engine - Core booking slot generation logic.
Calculates available slots based on: WeeklyAvailability - ExceptionDates - ExistingAppointments
"""

from datetime import datetime, timedelta, date, time
from typing import List, Dict, Optional
from django.db import transaction
from django.db.models import Q
from django.conf import settings
from django.utils import timezone

from .models import WeeklyAvailability, ExceptionDate, Appointment


class TimeSlot:
    """Represents an available time slot."""
    
    def __init__(self, start_time: time, end_time: time, date: date, modality: List[str]):
        self.start_time = start_time
        self.end_time = end_time
        self.date = date
        self.modality = modality
    
    def to_dict(self) -> Dict:
        return {
            'date': self.date.isoformat(),
            'start_time': self.start_time.strftime('%H:%M'),
            'end_time': self.end_time.strftime('%H:%M'),
            'modality': self.modality,
        }


class AvailabilityEngine:
    """
    Core engine for calculating available booking slots.
    Uses select_for_update() for slot locking during booking.
    
    Single-clinic mode: doctor_id is optional and kept for API compatibility.
    """
    
    def __init__(self, doctor_id: int = None, slot_duration_minutes: int = None):
        # doctor_id kept for API compatibility but not used in single-clinic mode
        self.doctor_id = doctor_id
        self.slot_duration = slot_duration_minutes or getattr(
            settings, 'BOOKING_SLOT_DURATION_MINUTES', 30
        )
        self.min_advance_days = getattr(settings, 'BOOKING_ADVANCE_DAYS_MIN', 1)
        self.max_advance_days = getattr(settings, 'BOOKING_ADVANCE_DAYS_MAX', 60)
    
    def get_available_slots(
        self,
        start_date: date = None,
        end_date: date = None,
        modality: str = None
    ) -> List[TimeSlot]:
        """
        Get all available slots within date range.
        
        Args:
            start_date: Start date (default: tomorrow)
            end_date: End date (default: start_date + max_advance_days)
            modality: Filter by modality ('virtual', 'in_person')
        
        Returns:
            List of available TimeSlot objects
        """
        # Set default date range
        today = timezone.now().date()
        if start_date is None:
            start_date = today + timedelta(days=self.min_advance_days)
        if end_date is None:
            end_date = today + timedelta(days=self.max_advance_days)
        
        # Ensure dates are within valid range
        min_date = today + timedelta(days=self.min_advance_days)
        max_date = today + timedelta(days=self.max_advance_days)
        start_date = max(start_date, min_date)
        end_date = min(end_date, max_date)
        
        # Get base data
        weekly_availability = self._get_weekly_availability()
        exception_dates = self._get_exception_dates(start_date, end_date)
        existing_appointments = self._get_existing_appointments(start_date, end_date)
        
        # Generate slots
        available_slots = []
        current_date = start_date
        
        while current_date <= end_date:
            day_of_week = current_date.weekday()
            
            # Check if date is blocked
            if current_date in exception_dates:
                exception = exception_dates[current_date]
                if exception.exception_type == ExceptionDate.ExceptionType.BLOCKED:
                    current_date += timedelta(days=1)
                    continue
            
            # Get availability for this day
            day_availability = [
                avail for avail in weekly_availability
                if avail.day_of_week == day_of_week and avail.is_active
            ]
            
            for avail in day_availability:
                # Check modality filter
                if modality:
                    if modality == 'virtual' and not avail.allows_virtual:
                        continue
                    if modality == 'in_person' and not avail.allows_in_person:
                        continue
                
                # Generate slots for this availability block
                slots = self._generate_slots_for_block(
                    current_date,
                    avail,
                    existing_appointments.get(current_date, [])
                )
                available_slots.extend(slots)
            
            current_date += timedelta(days=1)
        
        return available_slots
    
    def get_slots_for_date(self, target_date: date, modality: str = None) -> List[TimeSlot]:
        """Get available slots for a specific date."""
        return self.get_available_slots(target_date, target_date, modality)
    
    def is_slot_available(
        self,
        target_date: date,
        target_time: time,
        modality: str = None,
        lock: bool = False
    ) -> bool:
        """
        Check if a specific slot is available.
        
        Args:
            target_date: Date to check
            target_time: Time to check
            modality: Modality to check
            lock: If True, use select_for_update for atomic booking
        
        Returns:
            Boolean indicating if slot is available
        """
        # Check if date is in valid range
        today = timezone.now().date()
        min_date = today + timedelta(days=self.min_advance_days)
        max_date = today + timedelta(days=self.max_advance_days)
        
        if target_date < min_date or target_date > max_date:
            return False
        
        # Check for exceptions
        exception = ExceptionDate.objects.filter(
            date=target_date,
            exception_type=ExceptionDate.ExceptionType.BLOCKED
        ).first()
        
        if exception:
            return False
        
        # Check weekly availability
        day_of_week = target_date.weekday()
        availability = WeeklyAvailability.objects.filter(
            day_of_week=day_of_week,
            is_active=True,
            start_time__lte=target_time,
            end_time__gt=target_time
        )
        
        if modality == 'virtual':
            availability = availability.filter(allows_virtual=True)
        elif modality == 'in_person':
            availability = availability.filter(allows_in_person=True)
        
        if not availability.exists():
            return False
        
        # Check for existing appointments
        appointment_query = Appointment.objects.filter(
            scheduled_date=target_date,
            scheduled_time=target_time,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.APPROVED
            ]
        )
        
        if lock:
            appointment_query = appointment_query.select_for_update()
        
        return not appointment_query.exists()
    
    @transaction.atomic
    def lock_slot(self, target_date: date, target_time: time, modality: str = None) -> bool:
        """
        Atomically check and lock a slot for booking.
        Uses select_for_update to prevent race conditions.
        """
        return self.is_slot_available(target_date, target_time, modality, lock=True)
    
    def _get_weekly_availability(self) -> List[WeeklyAvailability]:
        """Get weekly availability (clinic-wide in single-clinic mode)."""
        return list(
            WeeklyAvailability.objects.filter(
                is_active=True
            ).order_by('day_of_week', 'start_time')
        )
    
    def _get_exception_dates(self, start_date: date, end_date: date) -> Dict[date, ExceptionDate]:
        """Get exception dates within range."""
        exceptions = ExceptionDate.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        return {exc.date: exc for exc in exceptions}
    
    def _get_existing_appointments(
        self,
        start_date: date,
        end_date: date
    ) -> Dict[date, List[Appointment]]:
        """Get existing appointments within range, grouped by date."""
        appointments = Appointment.objects.filter(
            scheduled_date__gte=start_date,
            scheduled_date__lte=end_date,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.APPROVED
            ]
        ).order_by('scheduled_time')
        
        grouped = {}
        for appt in appointments:
            if appt.scheduled_date not in grouped:
                grouped[appt.scheduled_date] = []
            grouped[appt.scheduled_date].append(appt)
        
        return grouped
    
    def _generate_slots_for_block(
        self,
        target_date: date,
        availability: WeeklyAvailability,
        existing_appointments: List[Appointment]
    ) -> List[TimeSlot]:
        """Generate available time slots for an availability block."""
        slots = []
        
        # Get booked times
        booked_times = {appt.scheduled_time for appt in existing_appointments}
        
        # Generate slots
        current_time = datetime.combine(target_date, availability.start_time)
        end_time = datetime.combine(target_date, availability.end_time)
        slot_delta = timedelta(minutes=self.slot_duration)
        
        while current_time + slot_delta <= end_time:
            slot_time = current_time.time()
            
            if slot_time not in booked_times:
                # Determine available modalities
                modalities = []
                if availability.allows_virtual:
                    modalities.append('virtual')
                if availability.allows_in_person:
                    modalities.append('in_person')
                
                slots.append(TimeSlot(
                    start_time=slot_time,
                    end_time=(current_time + slot_delta).time(),
                    date=target_date,
                    modality=modalities
                ))
            
            current_time += slot_delta
        
        return slots


def get_available_dates(doctor_id: int, days: int = 30) -> List[date]:
    """
    Get a list of dates that have any available slots.
    Useful for calendar highlighting.
    """
    engine = AvailabilityEngine(doctor_id)
    today = timezone.now().date()
    start_date = today + timedelta(days=1)
    end_date = today + timedelta(days=days)
    
    slots = engine.get_available_slots(start_date, end_date)
    
    # Get unique dates
    available_dates = sorted(set(slot.date for slot in slots))
    return available_dates
