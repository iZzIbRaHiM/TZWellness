# TF Welfare Platform - PostgreSQL Migration Guide

## Prerequisites

1. **PostgreSQL 14+** installed and running
2. **Python 3.11+** installed
3. **Redis** installed and running (for Celery)
4. **Node.js 18+** installed (for frontend)

## Step 1: Database Setup

### Create PostgreSQL Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tf_wellfare;

# Create user (optional - for security)
CREATE USER tf_wellfare_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tf_wellfare TO tf_wellfare_user;

# Exit
\q
```

## Step 2: Backend Setup

### Configure Environment

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Set DB_ENGINE=django.db.backends.postgresql
```

### Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Run Migrations

```bash
# Create database schema
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Email: admin@tfwellfare.com
# Password: (choose a secure password)
```

### Verify Setup

```bash
# Check for any issues
python manage.py check

# Test database connection
python manage.py dbshell
\dt
\q
```

## Step 3: Start Redis (Required for Celery)

```bash
# Windows (if installed via Memurai or WSL)
redis-server

# Linux/Mac
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

## Step 4: Start Celery Workers

```bash
# In a new terminal (backend directory)
celery -A config worker -l info

# In another terminal (for scheduled tasks)
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

## Step 5: Start Backend Server

```bash
# Development server
python manage.py runserver

# The API will be available at http://localhost:8000
```

## Step 6: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## Step 7: Flush Dummy Data (Before Production)

```bash
cd backend

# This will DELETE ALL DATA - use carefully!
python manage.py flush_data --confirm
```

## Production Deployment

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Environment Variables for Production

Update `.env` with:

```bash
DEBUG=False
SECRET_KEY=generate-new-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DB_PASSWORD=strong-production-password
```

### Generate New Secret Key

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Verification Checklist

- [ ] PostgreSQL database created
- [ ] Migrations applied successfully
- [ ] Superuser account created
- [ ] Redis running
- [ ] Celery workers running
- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 3000)
- [ ] Can access admin panel at http://localhost:3000/admin
- [ ] Dashboard shows real-time stats
- [ ] Appointment approval/rejection works
- [ ] Activity log updates

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
pg_isready  # All platforms

# Test connection
psql -U postgres -h localhost -d tf_wellfare
```

### Migration Errors

```bash
# Reset migrations (development only!)
python manage.py migrate --fake appointments zero
python manage.py migrate appointments

# Or start fresh
dropdb tf_wellfare
createdb tf_wellfare
python manage.py migrate
```

### Celery Not Working

```bash
# Check Redis connection
redis-cli ping

# Should return: PONG
```

## API Endpoints

### Dashboard
- `GET /api/v1/dashboard/summary/` - Dashboard statistics
- `GET /api/v1/dashboard/pending/` - Pending appointments
- `GET /api/v1/dashboard/activity/` - Recent activity
- `POST /api/v1/dashboard/appointments/{id}/approve/` - Approve appointment
- `POST /api/v1/dashboard/appointments/{id}/reject/` - Reject appointment

### Appointments
- `GET /api/v1/appointments/available-slots/` - Get available slots
- `POST /api/v1/appointments/book/` - Book appointment
- `GET /api/v1/appointments/{reference_id}/` - Lookup appointment

### Documentation
- API Docs: http://localhost:8000/api/docs/
- Schema: http://localhost:8000/api/schema/

## Support

For issues, check the logs:
- Backend: `backend/logs/django.log`
- Celery: Check terminal output
- Frontend: Check browser console
