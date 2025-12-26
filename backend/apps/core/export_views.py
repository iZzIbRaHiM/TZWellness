"""
Export views for dashboard analytics.
Provides CSV/Excel export functionality.
"""

import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta

from apps.appointments.models import Appointment


class ExportAppointmentsCSV(APIView):
    """
    GET /api/v1/dashboard/export/appointments/
    
    Export appointments as CSV file.
    Query params:
    - status: Filter by status (optional)
    - start_date: Start date filter (YYYY-MM-DD)
    - end_date: End date filter (YYYY-MM-DD)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # Get filter parameters
        status = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Base queryset
        queryset = Appointment.objects.all().order_by('-created_at')
        
        # Apply filters
        if status:
            queryset = queryset.filter(status=status)
        if start_date:
            queryset = queryset.filter(scheduled_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_date__lte=end_date)
        
        # Create HTTP response with CSV content type
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="appointments_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'Reference ID',
            'Patient Name',
            'Patient Email',
            'Patient Phone',
            'Service',
            'Date',
            'Time',
            'Modality',
            'Patient Type',
            'Status',
            'Reason',
            'Created At',
        ])
        
        # Write data rows
        for appointment in queryset:
            writer.writerow([
                appointment.reference_id,
                appointment.patient_name,
                appointment.patient_email,
                appointment.patient_phone,
                appointment.service.name if appointment.service else 'N/A',
                appointment.scheduled_date.strftime('%Y-%m-%d'),
                appointment.scheduled_time.strftime('%H:%M'),
                appointment.get_modality_display(),
                appointment.get_patient_type_display(),
                appointment.get_status_display(),
                appointment.reason or '',
                appointment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ])
        
        return response


class ExportDashboardStatsCSV(APIView):
    """
    GET /api/v1/dashboard/export/stats/
    
    Export dashboard statistics summary as CSV.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Aggregate statistics
        stats = {
            'Total Appointments': Appointment.objects.count(),
            'Pending': Appointment.objects.filter(status=Appointment.Status.PENDING).count(),
            'Approved': Appointment.objects.filter(status=Appointment.Status.APPROVED).count(),
            'Completed': Appointment.objects.filter(status=Appointment.Status.COMPLETED).count(),
            'Cancelled': Appointment.objects.filter(status=Appointment.Status.CANCELLED).count(),
            'Today': Appointment.objects.filter(scheduled_date=today).count(),
            'This Week': Appointment.objects.filter(
                scheduled_date__gte=today - timedelta(days=7)
            ).count(),
            'This Month': Appointment.objects.filter(
                scheduled_date__gte=today - timedelta(days=30)
            ).count(),
        }
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="dashboard_stats_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Metric', 'Value'])
        
        for key, value in stats.items():
            writer.writerow([key, value])
        
        return response
