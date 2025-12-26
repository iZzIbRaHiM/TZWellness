"""
Health check endpoints for monitoring.
"""

from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.views.decorators.http import require_GET
from django.views.decorators.cache import never_cache
import logging

logger = logging.getLogger(__name__)


@never_cache
@require_GET
def health_check(request):
    """
    Basic health check endpoint.
    Returns 200 if application is running and database is accessible.
    """
    try:
        # Check database connection
        connection.ensure_connection()
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': request.build_absolute_uri(),
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JsonResponse({
            'status': 'unhealthy',
            'database': 'error',
            'error': str(e)
        }, status=503)


@never_cache
@require_GET
def readiness_check(request):
    """
    Readiness check for Kubernetes/Docker.
    Checks if application is ready to handle requests.
    """
    checks = {
        'database': False,
        'cache': False,
    }
    
    # Check database
    try:
        connection.ensure_connection()
        checks['database'] = True
    except Exception as e:
        logger.error(f"Database check failed: {e}")
    
    # Check Redis cache
    try:
        cache.set('health_check', 'ok', 1)
        checks['cache'] = cache.get('health_check') == 'ok'
    except Exception as e:
        logger.error(f"Cache check failed: {e}")
    
    ready = all(checks.values())
    status_code = 200 if ready else 503
    
    return JsonResponse({
        'ready': ready,
        'checks': checks,
    }, status=status_code)


@never_cache
@require_GET
def liveness_check(request):
    """
    Liveness check for Kubernetes.
    Simple check that the application process is running.
    """
    return JsonResponse({
        'alive': True,
        'status': 'running'
    })
