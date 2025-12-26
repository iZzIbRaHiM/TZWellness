"""
Service URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ServiceViewSet,
    ServiceCategoryViewSet,
    TestimonialListView,
    ServiceAdminViewSet,
)

app_name = 'services'

router = DefaultRouter()
router.register(r'categories', ServiceCategoryViewSet, basename='category')
router.register(r'', ServiceViewSet, basename='service')

# Admin router
admin_router = DefaultRouter()
admin_router.register(r'', ServiceAdminViewSet, basename='admin-service')

urlpatterns = [
    path('testimonials/', TestimonialListView.as_view(), name='testimonial-list'),
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
