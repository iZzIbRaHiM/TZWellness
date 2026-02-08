# Railway Quick Commands Reference

## Initial Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to existing project
railway link

# Or create new project
railway init
```

## Deployment

```bash
# Deploy current directory
railway up

# Deploy with specific environment
railway up --environment production

# Deploy from specific branch
railway up --branch main
```

## Database Management

```bash
# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Access Django shell
railway run python manage.py shell

# Access database shell
railway run python manage.py dbshell

# Load fixtures
railway run python manage.py loaddata fixtures.json

# Dump data
railway run python manage.py dumpdata > backup.json
```

## Environment Variables

```bash
# List all variables
railway variables

# Set a variable
railway variables set KEY=value

# Delete a variable
railway variables delete KEY
```

## Logs & Monitoring

```bash
# View logs
railway logs

# Follow logs in real-time
railway logs --follow

# Filter logs by service
railway logs --service web
```

## Services Management

```bash
# List all services
railway service

# Connect to a service
railway connect

# Open service in browser
railway open
```

## Database Backup

```bash
# Backup PostgreSQL database
railway run pg_dump $DATABASE_URL > backup.sql

# Restore database
railway run psql $DATABASE_URL < backup.sql

# Django backup
railway run python manage.py dumpdata --natural-foreign --natural-primary > db_backup.json
```

## Troubleshooting

```bash
# Check service status
railway status

# View recent deployments
railway list

# Restart service
railway restart

# Redeploy
railway up --force
```

## Health Checks

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health/

# Test readiness
curl https://your-app.railway.app/api/health/readiness/

# Test API root
curl https://your-app.railway.app/api/
```

## Local Development

```bash
# Run with Railway environment variables
railway run python manage.py runserver

# Run any command with Railway env
railway run <command>

# Shell with Railway environment
railway shell
```

## Celery Workers (if separate service)

```bash
# Start worker
railway run celery -A config worker --loglevel=info

# Start beat scheduler
railway run celery -A config beat --loglevel=info

# Inspect workers
railway run celery -A config inspect active

# Purge all tasks
railway run celery -A config purge
```

## Static Files

```bash
# Collect static files
railway run python manage.py collectstatic --noinput

# Clear collected static files
railway run python manage.py collectstatic --clear --noinput
```

## Django Management

```bash
# Create app
railway run python manage.py startapp appname

# Make migrations
railway run python manage.py makemigrations

# Show migrations
railway run python manage.py showmigrations

# SQL for migration
railway run python manage.py sqlmigrate app_name migration_name

# Check for issues
railway run python manage.py check
```

## Testing on Railway

```bash
# Run tests
railway run python manage.py test

# Run specific test
railway run python manage.py test apps.appointments.tests

# Run with coverage
railway run coverage run manage.py test
railway run coverage report
```

## Cleanup

```bash
# Clear sessions
railway run python manage.py clearsessions

# Clear cache
railway run python manage.py clear_cache
```

## Domain Management

```bash
# Generate domain
railway domain

# Use custom domain (via dashboard)
# Settings > Domains > Add Domain
```

## Common Issues & Fixes

### Build Fails
```bash
# Check logs
railway logs

# Try rebuilding
railway up --force

# Clear build cache (in dashboard)
```

### Database Connection Error
```bash
# Verify DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
railway run python manage.py check --database default
```

### Static Files Not Loading
```bash
# Recollect static files
railway run python manage.py collectstatic --noinput --clear

# Verify STATIC_ROOT
railway run python manage.py shell -c "from django.conf import settings; print(settings.STATIC_ROOT)"
```

### CORS Issues
```bash
# Check CORS settings
railway run python manage.py shell -c "from django.conf import settings; print(settings.CORS_ALLOWED_ORIGINS)"

# Update CORS origins
railway variables set CORS_ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

## Environment-Specific Deployment

```bash
# Create environment
railway environment create staging

# Deploy to staging
railway up --environment staging

# Switch environment
railway environment select production
```

## Monitoring & Performance

```bash
# View metrics (in dashboard)
# Project > Service > Metrics

# Check memory usage
railway logs | grep memory

# Monitor requests
railway logs --follow | grep "GET\|POST"
```

## Pro Tips

1. **Use .railwayignore**: Exclude unnecessary files from deployment
2. **Environment variables**: Never hardcode secrets, use Railway variables
3. **Health checks**: Configure in `railway.toml` for automatic restarts
4. **Separate services**: Run web, worker, and beat as separate Railway services
5. **Database backups**: Set up automatic backups in Railway dashboard
6. **Monitoring**: Use Sentry DSN for error tracking
7. **Scaling**: Adjust resources in Service Settings as needed
8. **Preview environments**: Use Railway's PR deployments for testing

## Resource Limits

**Starter Plan ($5/month):**
- 512 MB RAM
- 1 GB disk
- Shared CPU

**Developer Plan ($20/month):**
- 8 GB RAM
- 100 GB disk
- Shared CPU
- Custom domains

## Quick Deploy Checklist

- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Add Redis service
- [ ] Set environment variables
- [ ] Connect GitHub repository
- [ ] Deploy application
- [ ] Run migrations
- [ ] Create superuser
- [ ] Test health endpoint
- [ ] Configure custom domain
- [ ] Set up monitoring

---

**Documentation**: https://docs.railway.app
**Support**: https://help.railway.app
