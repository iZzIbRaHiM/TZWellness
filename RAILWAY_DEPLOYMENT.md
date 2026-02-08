# Railway Deployment Guide for TF Wellfare Backend

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected
- PostgreSQL and Redis services configured

## Quick Start

### 1. Create New Project on Railway
```bash
# Install Railway CLI (optional)
npm install -g @railway/cli
railway login
```

### 2. Add PostgreSQL Database
1. Go to your Railway project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` environment variable

### 3. Add Redis Service
1. Click "New" → "Database" → "Add Redis"
2. Railway will automatically create a `REDIS_URL` environment variable

### 4. Configure Environment Variables

Add these variables in Railway Dashboard (Settings → Variables):

#### Required Variables
```
DJANGO_SETTINGS_MODULE=config.settings.railway
SECRET_KEY=<generate-a-secure-random-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app,*.up.railway.app,<your-custom-domain>
```

#### Database (Auto-configured by Railway)
```
DATABASE_URL=<automatically-set-by-railway>
REDIS_URL=<automatically-set-by-railway>
```

#### CORS Configuration
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

#### Email Configuration (Optional)
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=TF Wellfare <noreply@tfwellfare.com>
```

#### Monitoring (Optional)
```
SENTRY_DSN=<your-sentry-dsn>
```

#### Clinic Configuration
```
CLINIC_NAME=TF Wellfare Medical Clinic
CLINIC_PHONE=+1 (555) 123-4567
CLINIC_EMAIL=contact@tfwellfare.com
CLINIC_ADDRESS=123 Wellness Avenue, Health City, HC 12345
```

### 5. Deploy

#### Option A: Connect GitHub Repository
1. Go to Railway Dashboard
2. Click "New" → "GitHub Repo"
3. Select your repository
4. Set root directory to `/backend` if monorepo
5. Railway will auto-detect Django and deploy

#### Option B: Deploy via CLI
```bash
cd backend
railway link
railway up
```

### 6. Run Migrations
After deployment, run migrations:
```bash
railway run python manage.py migrate
```

Or use the Railway CLI:
```bash
railway run python manage.py createsuperuser
```

## Service Configuration

### Web Service (Main Django App)
- **Build Command**: Automatically handled by `nixpacks.toml`
- **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120`
- **Health Check**: `/api/health/`

### Celery Worker (Optional - Separate Service)
To run Celery workers:
1. Create a new service in Railway
2. Connect the same repository
3. Set custom start command: `celery -A config worker --loglevel=info`
4. Use the same environment variables

### Celery Beat (Optional - Separate Service)
For scheduled tasks:
1. Create another service
2. Set start command: `celery -A config beat --loglevel=info`
3. Use the same environment variables

## Important Files

- `Procfile` - Process definitions for Railway
- `railway.toml` - Railway-specific build configuration
- `nixpacks.toml` - Build system configuration
- `runtime.txt` - Python version specification
- `.railwayignore` - Files to ignore during deployment
- `config/settings/railway.py` - Railway production settings
- `requirements.txt` - Python dependencies

## Post-Deployment Steps

### 1. Create Superuser
```bash
railway run python manage.py createsuperuser
```

### 2. Verify Health Check
```bash
curl https://your-app.railway.app/api/health/
```

### 3. Test API
```bash
curl https://your-app.railway.app/api/
```

### 4. Check Logs
```bash
railway logs
```

## Domain Configuration

### Add Custom Domain
1. Go to Railway project settings
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Follow DNS configuration instructions
5. Update `ALLOWED_HOSTS` to include your domain
6. Update `CORS_ALLOWED_ORIGINS` if needed

## Monitoring & Debugging

### View Logs
```bash
railway logs
railway logs --follow  # Real-time logs
```

### Access Django Shell
```bash
railway run python manage.py shell
```

### Database Access
```bash
railway run python manage.py dbshell
```

## Scaling

### Increase Resources
1. Go to Railway project
2. Click on your service
3. Go to "Settings" → "Resources"
4. Adjust memory/CPU as needed

### Add Worker Processes
Modify the gunicorn command in `railway.toml`:
```
--workers <number>  # Default is 4
```

## Troubleshooting

### Build Fails
- Check `railway logs` for errors
- Verify all requirements are in `requirements.txt`
- Ensure Python version matches `runtime.txt`

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure migrations have been run

### Static Files Not Loading
- Verify `collectstatic` ran during build
- Check `STATIC_ROOT` and `STATIC_URL` settings
- Ensure WhiteNoise is configured correctly

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Ensure protocol (http/https) matches

### 502 Bad Gateway
- Check application logs for startup errors
- Verify gunicorn is binding to `0.0.0.0:$PORT`
- Increase worker timeout if needed

## Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DJANGO_SETTINGS_MODULE | Yes | - | `config.settings.railway` |
| SECRET_KEY | Yes | - | Django secret key |
| DEBUG | Yes | False | Debug mode |
| ALLOWED_HOSTS | Yes | - | Comma-separated domains |
| DATABASE_URL | Yes | Auto | PostgreSQL connection URL |
| REDIS_URL | Yes | Auto | Redis connection URL |
| CORS_ALLOWED_ORIGINS | Yes | - | Comma-separated frontend URLs |
| EMAIL_HOST_USER | No | - | SMTP username |
| EMAIL_HOST_PASSWORD | No | - | SMTP password |
| SENTRY_DSN | No | - | Sentry monitoring URL |

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Secure `SECRET_KEY` generated
- [ ] `ALLOWED_HOSTS` properly configured
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Database backups configured in Railway
- [ ] Environment variables secured
- [ ] Sentry or monitoring configured

## Cost Optimization

Railway offers:
- **Starter Plan**: $5/month (Hobby)
- **Pro Plan**: $20/month + usage
- **Free Trial**: $5 credit (no credit card)

Tips:
- Use single PostgreSQL instance for multiple apps
- Monitor resource usage in Railway dashboard
- Scale workers based on actual load

## Backup & Recovery

### Database Backups
Railway automatically backs up PostgreSQL:
- Access via Railway Dashboard → Database → Backups
- Can restore to any point in time

### Manual Backup
```bash
railway run python manage.py dumpdata > backup.json
```

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure monitoring with Sentry
3. Add custom domain
4. Set up automated database backups
5. Configure CDN for media files (if needed)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Create issue in GitHub repo

---

**Deployment Status**: Ready for Railway ✅
**Last Updated**: February 2026
