"""
Core utility functions for TF Wellfare.
"""

import secrets
import string
from django.conf import settings


def generate_reference_id(length=None):
    """
    Generate a unique reference ID for appointments.
    Format: Alphanumeric, uppercase, 12 characters by default.
    Example: TFW-A3B7K9M2
    """
    if length is None:
        length = getattr(settings, 'BOOKING_REFERENCE_ID_LENGTH', 12)
    
    # Generate random alphanumeric string
    alphabet = string.ascii_uppercase + string.digits
    # Remove confusing characters
    alphabet = alphabet.replace('O', '').replace('0', '').replace('I', '').replace('1', '').replace('L', '')
    
    random_part = ''.join(secrets.choice(alphabet) for _ in range(length - 4))
    
    return f"TFW-{random_part}"


def format_phone_number(phone):
    """Format phone number to a consistent format."""
    # Remove all non-numeric characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Format based on length
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    else:
        return phone


def validate_email_domain(email):
    """Check if email domain is valid (not disposable)."""
    disposable_domains = [
        'tempmail.com', 'throwaway.com', 'guerrillamail.com',
        'mailinator.com', '10minutemail.com', 'temp-mail.org',
    ]
    
    domain = email.lower().split('@')[-1]
    return domain not in disposable_domains


def sanitize_html(content):
    """Basic HTML sanitization for user content."""
    import re
    
    # Remove script tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove style tags
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove on* event handlers
    content = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
    
    return content
