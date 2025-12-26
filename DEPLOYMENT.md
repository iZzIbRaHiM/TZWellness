# 🚀 Deployment Guide - TF Wellfare Medical Platform

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd TF\ Wellfare
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Run migrations**
```bash
docker-compose exec backend python manage.py migrate
```

5. **Create superuser**
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/

### Health Checks

Monitor service health:
```bash
# Application health
curl http://localhost:8000/health/

# Readiness check (all services)
curl http://localhost:8000/ready/

# Liveness check
curl http://localhost:8000/alive/
```

---

## Production Deployment

### Environment Variables

Critical production settings in `.env`:

```bash
# Security
SECRET_KEY=<generate-with-django-secret-key-generator>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (use managed service)
DB_NAME=tf_wellfare_prod
DB_USER=prod_user
DB_PASSWORD=<strong-password>
DB_HOST=your-db-host.com
DB_PORT=5432

# Redis (use managed service)
REDIS_URL=redis://your-redis-host:6379/0

# Email (production SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

### Deployment Steps

1. **Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Run migrations**
```bash
docker-compose -f docker-compose.prod.yml run backend python manage.py migrate
```

3. **Collect static files**
```bash
docker-compose -f docker-compose.prod.yml run backend python manage.py collectstatic --noinput
```

4. **Start services**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

Use health check endpoints for probes:

```yaml
livenessProbe:
  httpGet:
    path: /alive/
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready/
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Monitoring

### Health Endpoints

- `/health/` - Basic health check (database connection)
- `/ready/` - Readiness check (all services)
- `/alive/` - Liveness check (process running)

### Celery Monitoring

Monitor Celery tasks:
```bash
# View worker status
docker-compose exec celery_worker celery -A config inspect active

# View scheduled tasks
docker-compose exec celery_beat celery -A config inspect scheduled
```

### Logs

View service logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f celery_worker
```

---

## Backup & Recovery

### Database Backup

Automated daily backups at 2 AM (configured in Celery Beat).

Manual backup:
```bash
docker-compose exec db pg_dump -U postgres tf_wellfare > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
docker-compose exec -T db psql -U postgres tf_wellfare < backup_20241224.sql
```

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend python manage.py check --database default
```

### Celery not processing tasks
```bash
# Check worker status
docker-compose exec celery_worker celery -A config inspect ping

# Restart worker
docker-compose restart celery_worker
```

### Frontend build errors
```bash
# Clear cache and rebuild
docker-compose exec frontend rm -rf .next node_modules
docker-compose exec frontend npm install
docker-compose restart frontend
```

---

## Performance Optimization

### Database
- Connection pooling enabled (CONN_MAX_AGE=60)
- Indexes on frequently queried fields
- Query optimization with select_related/prefetch_related

### Caching
- Redis for session storage
- API response caching (15 min for services)
- Rate limiting cache

### Frontend
- Static site generation (SSG)
- Image optimization
- Code splitting

---

## Security Checklist

- [x] SECRET_KEY changed from default
- [x] DEBUG=False in production
- [x] ALLOWED_HOSTS properly configured
- [x] CORS origins restricted
- [x] Rate limiting enabled
- [x] Honeypot field active
- [x] HTTPS/SSL certificate installed
- [x] Database credentials secured
- [x] Redis password set
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Log aggregation setup

---

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Health checks: http://localhost:8000/health/
- API docs: http://localhost:8000/api/docs/
