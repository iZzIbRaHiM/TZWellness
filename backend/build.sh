#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Add gunicorn to requirements if not present
pip install gunicorn psycopg2-binary

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate --no-input

# Create superuser if it doesn't exist (optional)
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@tzwellness.com').exists():
    User.objects.create_superuser(
        email='admin@tzwellness.com',
        password='ChangeMe123!',
        full_name='Admin User'
    )
    print('Superuser created: admin@tzwellness.com / ChangeMe123!')
else:
    print('Superuser already exists')
EOF

echo "Build completed successfully!"
