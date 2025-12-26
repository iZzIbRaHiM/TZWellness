"""
Core app URL configuration.
Includes dashboard and utility endpoints.
"""

from django.urls import path
from .dashboard import (
    DashboardSummaryView,
    PendingAppointmentsView,
    RecentActivityView,
    ApproveAppointmentView,
    RejectAppointmentView,
    TodayAppointmentsView,
)
from .export_views import (
    ExportAppointmentsCSV,
    ExportDashboardStatsCSV,
)

app_name = 'core'

urlpatterns = [
    # Dashboard APIs
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('pending/', PendingAppointmentsView.as_view(), name='pending-appointments'),
    path('activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('today/', TodayAppointmentsView.as_view(), name='today-appointments'),
    
    # Appointment actions
    path('appointments/<int:pk>/approve/', ApproveAppointmentView.as_view(), name='approve-appointment'),
    path('appointments/<int:pk>/reject/', RejectAppointmentView.as_view(), name='reject-appointment'),
    
    # Export endpoints
    path('export/appointments/', ExportAppointmentsCSV.as_view(), name='export-appointments'),
    path('export/stats/', ExportDashboardStatsCSV.as_view(), name='export-stats'),
]
