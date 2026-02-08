# Backend - Railway Deployment Ready 🚀

Django REST API backend for TF Wellfare Medical Clinic, optimized for Railway deployment.

## 🎯 Railway Deployment Status

✅ **Ready for Railway Deployment**

All necessary configuration files are in place:
- `Procfile` - Process definitions
- `railway.toml` - Railway configuration
- `nixpacks.toml` - Build system config
- `runtime.txt` - Python version
- `.railwayignore` - Deployment exclusions
- `config/settings/railway.py` - Railway-specific settings

## 📋 Quick Deploy to Railway

### 1. Prerequisites
- Railway account: https://railway.app
- GitHub repository connected
- Railway CLI (optional): `npm install -g @railway/cli`

### 2. One-Click Setup

**Via Railway Dashboard:**
1. Create new project on Railway
2. Click "Deploy from GitHub repo"
3. Select this repository
4. Add PostgreSQL database (New → Database → PostgreSQL)
5. Add Redis service (New → Database → Redis)
6. Set environment variables (see below)
7. Deploy automatically starts!

**Via CLI:**
```bash
cd backend
railway login
railway init
railway up
```

### 3. Required Environment Variables

Set these in Railway Dashboard → Settings → Variables:

```bash
# Django Core
DJANGO_SETTINGS_MODULE=config.settings.railway
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app,your-domain.com

# CORS (Your Frontend URLs)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Email (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
```

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically set by Railway when you add PostgreSQL and Redis services.

### 4. Post-Deployment

```bash
# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Verify health
curl https://your-app.railway.app/api/health/
```

## 🏗️ Project Structure

```
backend/
├── apps/                    # Django applications
│   ├── appointments/        # Booking & scheduling
│   ├── blog/               # Blog/articles CMS
│   ├── core/               # Core functionality & health checks
│   ├── events/             # Events management
│   ├── resources/          # Educational resources
│   ├── services/           # Medical services
│   └── users/              # User authentication
├── config/                  # Django configuration
│   ├── settings/
│   │   ├── base.py         # Base settings
│   │   ├── local.py        # Development settings
│   │   ├── production.py   # Render settings
│   │   └── railway.py      # Railway settings ✨
│   ├── urls.py             # URL routing
│   ├── wsgi.py             # WSGI config
│   └── celery.py           # Celery config
├── Procfile                 # Railway processes ✨
├── railway.toml            # Railway config ✨
├── nixpacks.toml           # Build config ✨
├── runtime.txt             # Python version ✨
├── .railwayignore          # Ignore patterns ✨
├── requirements.txt        # Python dependencies
├── manage.py               # Django CLI
└── README.md               # This file
```

## 🔧 Technical Stack

- **Framework**: Django 5.0+ with Django REST Framework
- **Database**: PostgreSQL (via Railway)
- **Cache/Queue**: Redis (via Railway)
- **Task Queue**: Celery with Celery Beat
- **Server**: Gunicorn
- **Static Files**: WhiteNoise
- **Authentication**: JWT (Simple JWT)
- **API Docs**: drf-spectacular (OpenAPI 3.0)

## 🚀 Features

- **RESTful API**: Comprehensive REST API with OpenAPI documentation
- **Authentication**: JWT-based authentication with refresh tokens
- **Booking System**: Medical appointment scheduling with availability management
- **CMS**: Blog and resources management
- **Events**: Event management with calendar integration
- **File Uploads**: Secure media file handling
- **Rate Limiting**: API rate limiting and throttling
- **Health Checks**: Kubernetes-style health and readiness endpoints
- **Background Tasks**: Celery for async tasks (email, reminders)
- **Caching**: Redis-based caching for performance
- **Monitoring**: Sentry integration for error tracking

## 📚 API Documentation

Once deployed, access interactive API docs:
- Swagger UI: `https://your-app.railway.app/api/schema/swagger-ui/`
- ReDoc: `https://your-app.railway.app/api/schema/redoc/`
- OpenAPI Schema: `https://your-app.railway.app/api/schema/`

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (get tokens)
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PATCH /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Cancel appointment
- `GET /api/appointments/availability/` - Check availability

### Services
- `GET /api/services/` - List medical services
- `GET /api/services/{id}/` - Get service details

### Blog
- `GET /api/blog/posts/` - List blog posts
- `GET /api/blog/posts/{slug}/` - Get post by slug

### Events
- `GET /api/events/` - List events
- `GET /api/events/{id}/` - Get event details
- `GET /api/events/{id}/calendar/` - iCalendar export

### Resources
- `GET /api/resources/` - List educational resources
- `GET /api/resources/{id}/` - Get resource details

### Health & Monitoring
- `GET /api/health/` - Basic health check
- `GET /api/health/readiness/` - Readiness probe
- `GET /api/dashboard/stats/` - Dashboard statistics

## 🛠️ Local Development

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.railway .env
# Edit .env with your local settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Run with Railway Environment
```bash
railway run python manage.py runserver
```

## 🔄 Celery Workers (Optional)

For background tasks, deploy additional Railway services:

### Celery Worker Service
- Start Command: `celery -A config worker --loglevel=info`
- Same environment variables as main app

### Celery Beat Service (Scheduler)
- Start Command: `celery -A config beat --loglevel=info`
- Same environment variables as main app

## 📊 Monitoring

### Health Checks
Railway automatically monitors:
- Path: `/api/health/`
- Expected: 200 OK
- Timeout: 100s

### Logs
```bash
railway logs --follow
```

### Sentry (Optional)
Add `SENTRY_DSN` environment variable for error tracking.

## 🔧 Configuration Files

### `Procfile`
Defines Railway processes (web, worker, beat).

### `railway.toml`
Railway-specific deployment configuration:
- Build command
- Start command  
- Health check path
- Restart policy

### `nixpacks.toml`
Build system configuration:
- Python version
- System packages
- Build phases

### `runtime.txt`
Specifies Python version (3.11.0).

### `.railwayignore`
Files to exclude from deployment.

## 🔒 Security

- HTTPS enforced in production
- HSTS enabled with preload
- XSS protection headers
- CSRF protection
- Secure cookie settings
- Rate limiting on all endpoints
- JWT token authentication
- SQL injection protection (Django ORM)
- Input validation and sanitization

## 📈 Scaling

Railway makes scaling easy:

1. **Vertical Scaling**: Increase resources in Service Settings
2. **Horizontal Scaling**: Deploy multiple instances (Pro plan)
3. **Database**: Upgrade PostgreSQL plan as needed
4. **Redis**: Scale Redis for more connections

## 🐛 Troubleshooting

### Build Fails
```bash
railway logs
# Check for missing dependencies or syntax errors
```

### Database Errors
```bash
railway variables | grep DATABASE_URL
railway run python manage.py migrate
```

### Static Files Not Loading
```bash
railway run python manage.py collectstatic --noinput
```

### CORS Issues
```bash
railway variables set CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SETTINGS_MODULE` | Yes | `config.settings.railway` |
| `SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | Yes | `False` for production |
| `ALLOWED_HOSTS` | Yes | Comma-separated domains |
| `DATABASE_URL` | Auto | PostgreSQL URL (Railway) |
| `REDIS_URL` | Auto | Redis URL (Railway) |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend URLs |
| `EMAIL_HOST_USER` | No | SMTP username |
| `EMAIL_HOST_PASSWORD` | No | SMTP password |
| `SENTRY_DSN` | No | Error monitoring |

## 📖 Documentation

- [Railway Deployment Guide](../RAILWAY_DEPLOYMENT.md)
- [Railway Commands Reference](../RAILWAY_COMMANDS.md)
- [API Documentation](https://your-app.railway.app/api/schema/swagger-ui/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

See [LICENSE](../LICENSE) file.

## 🆘 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues

---

**Status**: Production Ready ✅  
**Deployment Platform**: Railway  
**Last Updated**: February 2026
