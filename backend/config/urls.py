"""
URL configuration for TF Wellfare project.
Versioned API structure: /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.core.health import health_check, readiness_check, liveness_check

# API v1 URLs
api_v1_patterns = [
    path('dashboard/', include('apps.core.urls')),
    path('appointments/', include('apps.appointments.urls')),
    path('services/', include('apps.services.urls')),
    path('blog/', include('apps.blog.urls')),
    path('events/', include('apps.events.urls')),
    path('resources/', include('apps.resources.urls')),
    path('auth/', include('apps.users.urls')),
]

urlpatterns = [
    # Health checks (for monitoring/orchestration)
    path('health/', health_check, name='health'),
    path('ready/', readiness_check, name='readiness'),
    path('alive/', liveness_check, name='liveness'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include(api_v1_patterns)),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
