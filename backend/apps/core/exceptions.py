"""
Custom exception handler for standardized API error responses.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized JSON error responses.
    
    Response format:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {...}  // Optional
        }
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        error_code = getattr(exc, 'default_code', 'error')
        error_message = str(exc.detail) if hasattr(exc, 'detail') else str(exc)
        
        # Handle different error types
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                details = exc.detail
                error_message = 'Validation error'
            elif isinstance(exc.detail, list):
                details = {'errors': exc.detail}
                error_message = exc.detail[0] if exc.detail else 'Error occurred'
            else:
                details = None
                error_message = str(exc.detail)
        else:
            details = None
        
        response.data = {
            'success': False,
            'error': {
                'code': error_code.upper() if isinstance(error_code, str) else 'ERROR',
                'message': error_message,
            }
        }
        
        if details:
            response.data['error']['details'] = details
        
        # Log the error
        logger.warning(
            f"API Error: {error_code} - {error_message}",
            extra={
                'status_code': response.status_code,
                'view': context.get('view').__class__.__name__ if context.get('view') else None,
            }
        )
    
    return response


class APIException(Exception):
    """Base exception for API errors."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'api_error'
    default_message = 'An error occurred'
    
    def __init__(self, message=None, code=None, details=None):
        self.message = message or self.default_message
        self.code = code or self.default_code
        self.details = details
        super().__init__(self.message)


class SlotUnavailableError(APIException):
    """Raised when a booking slot is no longer available."""
    status_code = status.HTTP_409_CONFLICT
    default_code = 'slot_unavailable'
    default_message = 'The selected time slot is no longer available'


class RateLimitExceededError(APIException):
    """Raised when rate limit is exceeded."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_code = 'rate_limit_exceeded'
    default_message = 'Too many requests. Please try again later.'


class InvalidBookingError(APIException):
    """Raised for invalid booking attempts."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'invalid_booking'
    default_message = 'Invalid booking request'
