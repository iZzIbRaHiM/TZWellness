# 🏥 TZ Wellness Health Platform

A production-grade, full-stack medical appointment booking system with real-time admin dashboard, automated email notifications, and PostgreSQL database.

[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### For Patients (Public)
- 🗓️ **Guest Booking** - No login required
- 📅 **Real-time Availability** - Only see open time slots
- 📧 **Email Confirmation** - Instant booking receipt
- 📱 **Modality Options** - Virtual, In-Person, or Phone
- 🔍 **Appointment Lookup** - Track by reference ID

### For Admins
- 📊 **Live Dashboard** - Real-time statistics
- ✅ **One-Click Approval** - Instant patient confirmation
- ❌ **Smart Rejection** - Auto-send reschedule email
- 📝 **Activity Feed** - Full audit trail
- 📧 **Calendar Invites** - Auto-generated .ics files
- 🎨 **Modern UI** - Emerald & Terracotta theme

### Technical Excellence
- 🔒 **Zero Mock Data** - All data from PostgreSQL
- ⚡ **Async Tasks** - Celery + Redis for emails
- 🔐 **Transaction Safety** - Prevents double booking
- 🚫 **Rate Limiting** - Abuse prevention (5/hour/email)
- 📈 **SQL Aggregations** - Real-time stats calculations
- 🎯 **Optimistic UI** - Instant feedback

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tz-wellness-health.git
cd tz-wellness-health
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 3. Start Celery (New Terminal)
```bash
cd backend
.\venv\Scripts\Activate.ps1
celery -A config worker -l info -P solo
```

### 4. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### 5. Access the Platform
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:8000/api/docs/

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | 5-minute setup guide |
| **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** | Database migration guide |
| **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** | Production deployment checklist |
| **[GOLDEN_PATH_TEST.md](GOLDEN_PATH_TEST.md)** | End-to-end test protocol |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | Complete feature documentation |

---

## 🎯 The Golden Path Test

Before deploying to production, run the mandatory Golden Path Test:

```bash
# 1. Flush all test data
python manage.py flush_data --confirm

# 2. Create a test booking
# Visit: http://localhost:3000/book
# Patient: John Smith, Email: your-email@gmail.com

# 3. Login to admin panel
# Visit: http://localhost:3000/admin

# 4. Approve the booking
# Click [Approve] button

# 5. Verify email sent
# Check inbox for confirmation + .ics calendar file

# 6. Verify stats updated
# Pending: 0, Total Patients: 1, Activity Log: Updated
```

**If all steps pass → Deploy to production ✅**

See [GOLDEN_PATH_TEST.md](GOLDEN_PATH_TEST.md) for detailed step-by-step instructions.

---

## 🏗️ Architecture

### Backend (Django 5.0)
```
backend/
├── apps/
│   ├── appointments/    # Booking engine
│   ├── core/           # Dashboard & utilities
│   ├── services/       # Service catalog
│   ├── blog/           # Content management
│   ├── events/         # Event management
│   └── users/          # Authentication
├── config/
│   ├── settings/       # Environment configs
│   ├── celery.py       # Task queue setup
│   └── urls.py         # API routes
└── manage.py
```

### Frontend (Next.js 14)
```
frontend/
├── src/
│   ├── app/            # App Router pages
│   ├── components/
│   │   ├── admin/      # Admin dashboard
│   │   ├── booking/    # Booking wizard
│   │   └── ui/         # Shadcn components
│   └── lib/
│       ├── api.ts      # API client
│       └── store.ts    # Zustand state
└── public/
```

---

## 🎨 Design System

### Color Palette
```css
/* Primary: Deep Emerald (Trust & Grounding) */
--emerald-950: #064E3B;

/* Action: Terracotta (Warmth & CTA) */
--terracotta-400: #E07A5F;

/* Background: Soft Sand (Calm) */
--sand-100: #F9F9F7;
```

### Typography
- **Headings**: Playfair Display (Serif)
- **Body**: Inter (Sans-serif)

---

## 📊 API Endpoints

### Public Endpoints
```
POST /api/v1/appointments/book/
GET  /api/v1/appointments/available-slots/
GET  /api/v1/services/
GET  /api/v1/blog/
GET  /api/v1/events/
```

### Admin Endpoints
```
GET  /api/v1/dashboard/summary/
GET  /api/v1/dashboard/pending/
GET  /api/v1/dashboard/activity/
POST /api/v1/dashboard/appointments/{id}/approve/
POST /api/v1/dashboard/appointments/{id}/reject/
```

### Documentation
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

---

## 🔧 Key Technologies

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.0, Django Rest Framework |
| **Database** | PostgreSQL 14+ |
| **Task Queue** | Celery + Redis |
| **Email** | SMTP (Gmail/SendGrid) + iCalendar |
| **Frontend** | Next.js 14 (App Router) |
| **UI Framework** | React 18 + TailwindCSS |
| **Components** | Shadcn/UI + Radix UI |
| **State** | TanStack Query + Zustand |
| **Deployment** | Docker + Docker Compose |

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python manage.py test
```

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### Golden Path Test (E2E)
```bash
# See GOLDEN_PATH_TEST.md for complete protocol
python manage.py flush_data --confirm
# Then follow manual test steps
```

---

## 🚢 Production Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create admin user
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### Environment Variables
```bash
# Backend (.env)
DEBUG=False
SECRET_KEY=your-secret-key-here
DB_ENGINE=django.db.backends.postgresql
DB_PASSWORD=strong-password
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🛡️ Security Features

- ✅ CSRF protection enabled
- ✅ SQL injection prevention (Django ORM)
- ✅ XSS protection (React escaping)
- ✅ Rate limiting (10 requests/hour/email)
- ✅ CORS restricted to allowed origins
- ✅ HTTPS in production (via reverse proxy)
- ✅ Secure password hashing (PBKDF2)
- ✅ JWT authentication for admin API

---

## 📈 Performance

### Backend
- Dashboard API: < 500ms
- Booking API: < 800ms (includes double-booking check)
- Database pooling enabled (CONN_MAX_AGE=60)

### Frontend
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Build optimizations: Next.js automatic code splitting

---

## 🗄️ Database Schema

### Core Models

**Appointment**
- `reference_id`: Unique public ID (APT-ABC123XYZ)
- `patient_details`: JSON {name, email, phone}
- `status`: pending | approved | rejected | completed | cancelled
- `modality`: virtual | in_person | phone
- `scheduled_date`, `scheduled_time`: Booking datetime
- `service`: FK to Service

**ActivityLog**
- `action_type`: appointment_approved | appointment_rejected | etc.
- `description`: Human-readable log message
- `actor`: FK to User (admin who performed action)
- `metadata`: JSON with additional context

See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for full schema.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developed by:** TZ Wellness Health  
**Contact:** info@tzwellnesshealth.com  
**Phone:** +1 (555) 123-4567

---

## 🎉 Acknowledgments

- [Django](https://www.djangoproject.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Celery](https://docs.celeryproject.org/) - Task queue
- [PostgreSQL](https://www.postgresql.org/) - Database

---

## 📞 Support

For issues and questions:

1. Check [QUICK_START.md](QUICK_START.md) for common setup issues
2. Review [GOLDEN_PATH_TEST.md](GOLDEN_PATH_TEST.md) for debugging
3. Open an issue on GitHub
4. Email: info@tzwellnesshealth.com

---

## 🚀 Status

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 25, 2025

---

**Built with ❤️ for better healthcare access**
