# Railway Deployment Checklist ✅

## Pre-Deployment Setup

### 1. Railway Account & Project
- [ ] Create Railway account at https://railway.app
- [ ] Create new project in Railway dashboard
- [ ] Install Railway CLI (optional): `npm install -g @railway/cli`
- [ ] Connect GitHub repository to Railway

### 2. Database Services
- [ ] Add PostgreSQL database to Railway project
  - Click "New" → "Database" → "Add PostgreSQL"
  - Railway auto-generates `DATABASE_URL`
- [ ] Add Redis service to Railway project
  - Click "New" → "Database" → "Add Redis"  
  - Railway auto-generates `REDIS_URL`

### 3. Environment Variables
Configure in Railway Dashboard → Settings → Variables:

#### Required Variables
- [ ] `DJANGO_SETTINGS_MODULE` = `config.settings.railway`
- [ ] `SECRET_KEY` = Generate secure key (use Django secret key generator)
- [ ] `DEBUG` = `False`
- [ ] `ALLOWED_HOSTS` = `*.railway.app,your-domain.com`
- [ ] `CORS_ALLOWED_ORIGINS` = Your frontend URL(s)

#### Email Configuration (Optional but Recommended)
- [ ] `EMAIL_BACKEND` = `django.core.mail.backends.smtp.EmailBackend`
- [ ] `EMAIL_HOST` = `smtp.gmail.com`
- [ ] `EMAIL_PORT` = `587`
- [ ] `EMAIL_USE_TLS` = `True`
- [ ] `EMAIL_HOST_USER` = Your email
- [ ] `EMAIL_HOST_PASSWORD` = App-specific password

#### Monitoring (Optional)
- [ ] `SENTRY_DSN` = Your Sentry DSN for error tracking

#### Clinic Information
- [ ] `CLINIC_NAME` = Your clinic name
- [ ] `CLINIC_PHONE` = Contact phone
- [ ] `CLINIC_EMAIL` = Contact email
- [ ] `CLINIC_ADDRESS` = Clinic address

## Deployment Configuration

### 4. Verify Configuration Files
All these files should be in `backend/` directory:

- [ ] `Procfile` ✅ Created
- [ ] `railway.toml` ✅ Created
- [ ] `nixpacks.toml` ✅ Created
- [ ] `runtime.txt` ✅ Created
- [ ] `.railwayignore` ✅ Created
- [ ] `config/settings/railway.py` ✅ Created
- [ ] `requirements.txt` ✅ Exists
- [ ] `.env.railway` ✅ Created (template)

### 5. Repository Configuration
- [ ] Push all changes to GitHub
- [ ] Ensure `main` branch is up to date
- [ ] Verify backend files are in correct directory
- [ ] Check `.gitignore` excludes sensitive files

## Deployment Process

### 6. Deploy to Railway

#### Option A: GitHub Integration (Recommended)
- [ ] In Railway, click "New" → "GitHub Repo"
- [ ] Select your repository
- [ ] Set root directory to `/backend` if monorepo
- [ ] Railway auto-detects Django and starts deployment
- [ ] Wait for build to complete (check logs)

#### Option B: Railway CLI
```bash
cd backend
railway login
railway link  # or railway init
railway up
```
- [ ] Run CLI deployment commands
- [ ] Monitor deployment in terminal

### 7. Post-Deployment Tasks

#### Database Setup
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```
- [ ] Run migrations
- [ ] Create superuser account
- [ ] Test database connection

#### Verification
- [ ] Check deployment logs: `railway logs`
- [ ] Test health endpoint: `https://your-app.railway.app/api/health/`
- [ ] Test API root: `https://your-app.railway.app/api/`
- [ ] Access admin panel: `https://your-app.railway.app/admin/`
- [ ] Test API documentation: `https://your-app.railway.app/api/schema/swagger-ui/`

#### Static Files
- [ ] Verify static files are loading
- [ ] Check admin CSS is working
- [ ] Confirm WhiteNoise is serving files

## Optional: Celery Workers

### 8. Background Task Services (Optional)
If you need background tasks:

#### Celery Worker Service
- [ ] Create new service in Railway
- [ ] Connect same repository
- [ ] Set start command: `celery -A config worker --loglevel=info`
- [ ] Copy all environment variables from main service
- [ ] Deploy worker service

#### Celery Beat Service (Scheduler)
- [ ] Create another service
- [ ] Set start command: `celery -A config beat --loglevel=info`
- [ ] Copy all environment variables
- [ ] Deploy beat service

## Domain & SSL

### 9. Custom Domain (Optional)
- [ ] Go to Railway service → Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter your custom domain
- [ ] Update DNS records (A/CNAME) as instructed
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Update `ALLOWED_HOSTS` to include custom domain
- [ ] Update `CORS_ALLOWED_ORIGINS` if needed
- [ ] Verify SSL certificate is issued

## Testing & Validation

### 10. Functional Testing
- [ ] Test user registration
- [ ] Test user login/logout
- [ ] Test JWT token refresh
- [ ] Create test appointment
- [ ] Test blog post creation (admin)
- [ ] Test service endpoints
- [ ] Test event endpoints
- [ ] Verify email sending (if configured)

### 11. API Testing
```bash
# Health check
curl https://your-app.railway.app/api/health/

# API root
curl https://your-app.railway.app/api/

# Test authentication
curl -X POST https://your-app.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```
- [ ] All endpoints return expected responses
- [ ] Authentication works correctly
- [ ] CORS headers are correct
- [ ] Rate limiting is functioning

### 12. Security Testing
- [ ] HTTPS is enforced
- [ ] HTTP redirects to HTTPS
- [ ] HSTS headers are present
- [ ] XSS protection headers set
- [ ] CSRF protection working
- [ ] Admin panel requires authentication
- [ ] Debug mode is OFF
- [ ] Secret key is secure (not default)

## Monitoring & Maintenance

### 13. Set Up Monitoring
- [ ] Configure Sentry for error tracking
- [ ] Set up Railway usage alerts
- [ ] Monitor database size
- [ ] Monitor Redis memory usage
- [ ] Check application logs regularly

### 14. Backup Strategy
- [ ] Enable Railway database backups
- [ ] Test database restore procedure
- [ ] Create manual backup: `railway run python manage.py dumpdata > backup.json`
- [ ] Store backups securely

### 15. Performance Optimization
- [ ] Monitor response times in logs
- [ ] Check database query performance
- [ ] Verify caching is working
- [ ] Adjust gunicorn workers if needed (in `railway.toml`)
- [ ] Monitor memory usage
- [ ] Upgrade Railway plan if needed

## Documentation

### 16. Update Documentation
- [ ] Document custom domain setup
- [ ] Note superuser credentials (securely)
- [ ] Document any custom environment variables
- [ ] Update team on deployment URL
- [ ] Share API documentation URL
- [ ] Update frontend to use production API URL

## Troubleshooting Reference

### Common Issues
- **Build fails**: Check `railway logs` for errors
- **Database connection**: Verify `DATABASE_URL` is set
- **Static files 404**: Run `railway run python manage.py collectstatic`
- **CORS errors**: Update `CORS_ALLOWED_ORIGINS`
- **502 Bad Gateway**: Check app startup logs, verify gunicorn binding

### Useful Commands
```bash
# View logs
railway logs --follow

# Run migrations
railway run python manage.py migrate

# Access shell
railway run python manage.py shell

# Restart service
railway restart

# Check variables
railway variables
```

## Success Criteria

### 17. Deployment Complete ✅
- [ ] Application is accessible via Railway URL
- [ ] Health endpoint returns 200 OK
- [ ] Admin panel is accessible
- [ ] API documentation is viewable
- [ ] Authentication works end-to-end
- [ ] Database operations are functional
- [ ] Static files load correctly
- [ ] HTTPS is enforced
- [ ] Error monitoring is active
- [ ] Backups are configured

## Next Steps

### 18. Post-Launch Tasks
- [ ] Integrate frontend with production API
- [ ] Load production data/fixtures
- [ ] Set up CI/CD pipeline (optional)
- [ ] Configure monitoring alerts
- [ ] Plan scaling strategy
- [ ] Schedule regular backups
- [ ] Document deployment process for team
- [ ] Set up staging environment (optional)

## Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Django Documentation**: https://docs.djangoproject.com
- **Project README**: `/backend/README.md`
- **Deployment Guide**: `/RAILWAY_DEPLOYMENT.md`
- **Command Reference**: `/RAILWAY_COMMANDS.md`

---

## Quick Reference

**Railway Dashboard**: https://railway.app/dashboard
**Health Check**: `https://your-app.railway.app/api/health/`
**API Docs**: `https://your-app.railway.app/api/schema/swagger-ui/`
**Admin Panel**: `https://your-app.railway.app/admin/`

---

**Checklist Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Ready for Deployment ✅
