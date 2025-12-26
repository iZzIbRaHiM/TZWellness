"""
Rate limiting middleware using IP + Email Hash strategies.
"""

import hashlib
import time
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings


class RateLimitMiddleware:
    """
    Custom rate limiting middleware with IP and email hash strategies.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Only rate limit specific endpoints
        if self._should_rate_limit(request):
            if not self._check_rate_limit(request):
                response = JsonResponse({
                    'success': False,
                    'error': {
                        'code': 'RATE_LIMIT_EXCEEDED',
                        'message': 'Too many requests. Please try again later.',
                    }
                }, status=429)
                response['Retry-After'] = '3600'  # 1 hour
                return response
        
        response = self.get_response(request)
        return response
    
    def _should_rate_limit(self, request):
        """Check if the request should be rate limited."""
        rate_limited_paths = [
            '/api/v1/appointments/book',
            '/api/v1/auth/login',
            '/api/v1/auth/register',
        ]
        return any(request.path.startswith(path) for path in rate_limited_paths)
    
    def _check_rate_limit(self, request):
        """
        Check rate limit using IP address.
        Returns True if request is allowed, False if rate limited.
        """
        ip = self._get_client_ip(request)
        cache_key = f'rate_limit:ip:{ip}'
        
        # Get current request count
        request_count = cache.get(cache_key, 0)
        
        # Limit: 10 requests per hour for booking endpoints
        limit = 10
        window = 3600  # 1 hour in seconds
        
        if request_count >= limit:
            return False
        
        # Increment counter
        cache.set(cache_key, request_count + 1, window)
        return True
    
    def _get_client_ip(self, request):
        """Get the client's IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def check_email_rate_limit(email, limit=5, window=3600):
        """
        Check rate limit by email hash.
        Can be called from views for additional protection.
        """
        email_hash = hashlib.sha256(email.lower().encode()).hexdigest()[:16]
        cache_key = f'rate_limit:email:{email_hash}'
        
        request_count = cache.get(cache_key, 0)
        
        if request_count >= limit:
            return False
        
        cache.set(cache_key, request_count + 1, window)
        return True
