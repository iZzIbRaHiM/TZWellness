"""
Production settings for TF Wellfare.
"""

from .base import *
import dj_database_url

DEBUG = False

# Parse DATABASE_URL for Render
DATABASES['default'] = dj_database_url.config(
    conn_max_age=600,
    conn_health_checks=True,
)

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS only
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Production logging - Console only for Render
LOGGING['handlers']['console'] = {
    'class': 'logging.StreamHandler',
    'formatter': 'verbose',
}
LOGGING['root'] = {
    'handlers': ['console'],
    'level': 'INFO',
}

