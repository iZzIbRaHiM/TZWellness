"""
Events URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EventViewSet,
    EventCategoryViewSet,
    EventAdminViewSet,
)

app_name = 'events'

router = DefaultRouter()
router.register(r'categories', EventCategoryViewSet, basename='category')
router.register(r'', EventViewSet, basename='event')

admin_router = DefaultRouter()
admin_router.register(r'', EventAdminViewSet, basename='admin-event')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
