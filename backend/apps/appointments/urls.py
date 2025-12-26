"""
Appointment URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AvailableSlotsView,
    AvailableDatesView,
    BookAppointmentView,
    AppointmentLookupView,
    CancelAppointmentView,
    AppointmentAdminViewSet,
    WeeklyAvailabilityViewSet,
    ExceptionDateViewSet,
)

app_name = 'appointments'

# Admin routers
admin_router = DefaultRouter()
admin_router.register(r'appointments', AppointmentAdminViewSet, basename='admin-appointment')
admin_router.register(r'availability', WeeklyAvailabilityViewSet, basename='admin-availability')
admin_router.register(r'exceptions', ExceptionDateViewSet, basename='admin-exception')

urlpatterns = [
    # Public booking endpoints
    path('slots/', AvailableSlotsView.as_view(), name='available-slots'),
    path('dates/', AvailableDatesView.as_view(), name='available-dates'),
    path('book/', BookAppointmentView.as_view(), name='book'),
    path('lookup/<str:reference_id>/', AppointmentLookupView.as_view(), name='lookup'),
    path('cancel/<str:reference_id>/', CancelAppointmentView.as_view(), name='cancel'),
    
    # Admin endpoints
    path('admin/', include(admin_router.urls)),
]
