"""
Railway deployment settings for TF Wellfare.
"""

from .base import *
import dj_database_url

DEBUG = False

# Parse DATABASE_URL automatically provided by Railway
DATABASES['default'] = dj_database_url.config(
    default=config('DATABASE_URL'),
    conn_max_age=600,
    conn_health_checks=True,
)

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS only
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Railway-specific: Allow Railway's health checks
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS', 
    default='*.railway.app,*.up.railway.app', 
    cast=Csv()
)

# Trust Railway's proxy
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Static files with WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Production logging - Console only for Railway
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
