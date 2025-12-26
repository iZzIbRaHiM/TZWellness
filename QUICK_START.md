# 🚀 TF Welfare Platform - Quick Start Guide

## Development Setup (5 Minutes)

### 1. Start PostgreSQL & Redis

```powershell
# Start PostgreSQL (should be running as service)
# Check status:
pg_isready

# Start Redis (if using Docker)
docker run -d -p 6379:6379 redis:alpine

# Or if installed locally:
redis-server
```

### 2. Start Backend (Terminal 1)

```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Django server
python manage.py runserver
```

**Backend will be at:** http://localhost:8000

### 3. Start Celery Worker (Terminal 2)

```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Celery worker
celery -A config worker -l info -P solo
```

**Note:** Use `-P solo` on Windows to avoid concurrency issues.

### 4. Start Celery Beat (Terminal 3 - Optional)

```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Celery beat scheduler
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

**Required for:** Scheduled appointment reminders and cleanup tasks.

### 5. Start Frontend (Terminal 4)

```powershell
cd frontend

# Start Next.js dev server
npm run dev
```

**Frontend will be at:** http://localhost:3000

---

## 🎯 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Public access |
| **Admin Panel** | http://localhost:3000/admin | admin@tfwellfare.com |
| **API Docs** | http://localhost:8000/api/docs/ | No auth required |
| **Django Admin** | http://localhost:8000/admin/ | Superuser account |

---

## 🧪 Quick Test

### Test Booking Flow

1. **Public Booking:**
   - Go to: http://localhost:3000/book
   - Fill form and submit
   - Check terminal for email output

2. **Admin Approval:**
   - Go to: http://localhost:3000/admin
   - Login (admin@tfwellfare.com)
   - See pending appointment
   - Click "Approve"
   - Check Celery logs for email task

---

## 🛠️ Common Commands

### Backend

```powershell
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Flush all data
python manage.py flush_data --confirm

# Collect static files
python manage.py collectstatic --noinput

# Run tests
python manage.py test

# Django shell
python manage.py shell
```

### Frontend

```powershell
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database

```powershell
# Access PostgreSQL
psql -U postgres -d tf_wellfare

# Backup database
pg_dump -U postgres tf_wellfare > backup.sql

# Restore database
psql -U postgres tf_wellfare < backup.sql

# Drop database (CAREFUL!)
dropdb tf_wellfare

# Create database
createdb tf_wellfare
```

---

## 🐛 Debugging

### Check Service Status

```powershell
# PostgreSQL
pg_isready

# Redis
redis-cli ping
# Should return: PONG

# Django server
# Open: http://localhost:8000/health/
# Should return: {"status": "ok"}

# Frontend
# Open: http://localhost:3000
# Should load homepage
```

### View Logs

```powershell
# Django logs
Get-Content backend\logs\django.log -Tail 50 -Wait

# Celery logs
# Check Terminal 2 output

# Frontend logs
# Check Terminal 4 output
```

### Common Issues

**Issue:** `psycopg2` import error
**Fix:** 
```powershell
pip install psycopg2-binary
```

**Issue:** Redis connection refused
**Fix:**
```powershell
# Start Redis
redis-server
```

**Issue:** Celery not picking up tasks
**Fix:**
```powershell
# Restart worker
# Press Ctrl+C in Terminal 2, then:
celery -A config worker -l info -P solo
```

**Issue:** Frontend can't connect to API
**Fix:**
```powershell
# Check .env.local has:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend\.env.local
```

---

## 📊 Monitoring

### Real-time Dashboard

- **Stats Update:** Every 30 seconds (auto-refresh)
- **Activity Feed:** Real-time via API polling
- **Pending Count:** Updates on approve/reject

### Email Testing

**Development (Console Backend):**
Emails print to Terminal 2 (Celery worker)

**Production (SMTP):**
Check `.env` has correct SMTP credentials:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## 🚀 Production Deployment

See detailed guides:
- **PostgreSQL Setup:** `POSTGRESQL_SETUP.md`
- **Production Deployment:** `PRODUCTION_DEPLOYMENT.md`

Quick production start:
```powershell
# Backend
docker-compose up -d

# Frontend (Vercel)
vercel --prod
```

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Essential
SECRET_KEY=your-secret-key
DEBUG=True
DB_ENGINE=django.db.backends.postgresql
DB_NAME=tf_wellfare
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_URL=redis://localhost:6379/0

# Email (development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Email (production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 API Endpoints Reference

### Public Endpoints

```
GET  /api/v1/appointments/available-slots/
POST /api/v1/appointments/book/
GET  /api/v1/appointments/{reference_id}/
POST /api/v1/appointments/{reference_id}/cancel/
GET  /api/v1/services/
GET  /api/v1/blog/
GET  /api/v1/events/
```

### Admin Endpoints (Authentication Required)

```
GET  /api/v1/dashboard/summary/
GET  /api/v1/dashboard/pending/
GET  /api/v1/dashboard/activity/
GET  /api/v1/dashboard/today/
POST /api/v1/dashboard/appointments/{id}/approve/
POST /api/v1/dashboard/appointments/{id}/reject/
```

### Authentication

```
POST /api/v1/auth/login/
POST /api/v1/auth/logout/
POST /api/v1/auth/refresh/
GET  /api/v1/auth/me/
```

---

## 🎨 Theme Colors

```css
/* Primary: Deep Emerald */
--emerald-950: #064E3B;

/* Action: Terracotta */
--terracotta-400: #E07A5F;

/* Background: Soft Sand */
--sand-100: #F9F9F7;
```

Used in:
- Sidebar: `bg-emerald-950`
- CTA Buttons: `bg-terracotta-400`
- Page Background: `bg-sand-100`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.0, DRF, PostgreSQL |
| **Frontend** | Next.js 14, React, TailwindCSS |
| **Task Queue** | Celery, Redis |
| **Email** | SMTP (Gmail/SendGrid) |
| **Calendar** | iCalendar (.ics files) |
| **Deployment** | Docker, Vercel |

---

## 🆘 Support Checklist

Before asking for help, verify:

- [ ] All services running (PostgreSQL, Redis, Django, Celery, Frontend)
- [ ] Environment variables configured
- [ ] Migrations applied
- [ ] No errors in terminal outputs
- [ ] API accessible at http://localhost:8000/api/v1/
- [ ] Frontend loads at http://localhost:3000

---

## 🎉 You're Ready!

If all 5 terminals are running without errors, you're good to go!

**Terminals:**
1. Backend (Django)
2. Celery Worker
3. Celery Beat (optional)
4. Frontend (Next.js)
5. PostgreSQL/Redis (if not running as service)

Happy coding! 🚀
