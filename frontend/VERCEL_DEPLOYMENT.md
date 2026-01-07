# 🚀 Vercel Deployment Guide for TZ Wellness Health

## ✅ Pre-Deployment Checklist

This document contains everything needed to deploy the TZ Wellness Health frontend to Vercel production.

---

## 1️⃣ Project Structure Verification

| Check | Status | Notes |
|-------|--------|-------|
| Using Next.js App Router (`src/app/`) | ✅ | Next.js 14.2.35 |
| No Express/server code in frontend | ✅ | Pure Next.js serverless |
| No `pages/api` routes (using external Django API) | ✅ | API calls go to Django backend |
| No filesystem writes (`fs.writeFile`) | ✅ | No persistent storage needed |
| No native binary dependencies | ✅ | All npm packages are serverless-safe |

---

## 2️⃣ Environment Variables Setup

### Required Variables (MUST SET IN VERCEL DASHBOARD)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend Django API URL | `https://api.tzwellnesshealth.com` |
| `NEXT_PUBLIC_SITE_URL` | Frontend production URL | `https://tzwellnesshealth.com` |

### Optional Variables (Recommended for Production)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `true` |

### Auto-Provided by Vercel (Do NOT set manually)

| Variable | Description |
|----------|-------------|
| `VERCEL_URL` | Deployment URL (for preview builds) |
| `VERCEL_ENV` | `production`, `preview`, or `development` |
| `NODE_ENV` | Always `production` on Vercel |

### How to Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable for the appropriate environments:
   - **Production**: Live site
   - **Preview**: PR/branch deployments
   - **Development**: Local development (optional)

---

## 3️⃣ Build Configuration

### package.json ✅
```json
{
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### next.config.js ✅
- TypeScript errors: **Enforced** (will fail build on errors)
- ESLint errors: **Enforced** (will fail build on errors)
- Security headers: **Configured**
- Image optimization: **Configured with allowed domains**

### vercel.json ✅
- Function timeout: 30 seconds
- Security headers: Configured
- API rewrites: Configured
- Static asset caching: Optimized

---

## 4️⃣ Backend Configuration Requirements

Your Django backend must be configured to accept requests from Vercel:

### Required Backend Environment Variables

```bash
# Django Settings
ALLOWED_HOSTS=api.tzwellnesshealth.com,tzwellnesshealth.com

# CORS Configuration - Add your Vercel domains
CORS_ALLOWED_ORIGINS=https://tzwellnesshealth.com,https://tz-wellness-health.vercel.app,https://*.vercel.app
```

### For Preview Deployments

If you want preview deployments to work, add a wildcard pattern:
```bash
CORS_ALLOWED_ORIGINS=https://tzwellnesshealth.com,https://*.vercel.app
```

Or dynamically handle CORS in Django:
```python
# settings/production.py
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://tzwellnesshealth\.com$",
]
```

---

## 5️⃣ Deployment Steps

### First-Time Deployment

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link project
   cd frontend
   vercel link
   ```

2. **Or via Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Vercel will auto-detect Next.js

3. **Set Environment Variables**
   - Add all required variables in Vercel Dashboard
   - Ensure they're set for Production environment

4. **Deploy**
   ```bash
   vercel --prod
   ```
   Or push to your main branch for auto-deployment.

### Subsequent Deployments

- **Production**: Push to `main` branch (auto-deploys)
- **Preview**: Push to any other branch or create PR
- **Manual**: Run `vercel --prod` from CLI

---

## 6️⃣ Post-Deployment Verification

### Quick Checks

| Test | URL | Expected Result |
|------|-----|-----------------|
| Homepage | `https://your-domain.vercel.app` | Loads without errors |
| API Connection | `https://your-domain.vercel.app/services` | Shows services from API |
| Booking Flow | `https://your-domain.vercel.app/book` | Calendar loads, slots available |
| Admin Login | `https://your-domain.vercel.app/admin` | Login form works |
| SEO | View page source | Schema.org JSON-LD present |

### Verification Commands

```bash
# Check if site is accessible
curl -I https://your-domain.vercel.app

# Verify security headers
curl -I https://your-domain.vercel.app | grep -E "(X-Frame|X-Content|X-XSS)"

# Test API proxy
curl https://your-domain.vercel.app/api/v1/services/
```

---

## 7️⃣ Common Issues & Solutions

### Issue: "NEXT_PUBLIC_API_URL cannot be localhost in production"

**Cause**: Environment variable not set in Vercel Dashboard.

**Solution**: Add `NEXT_PUBLIC_API_URL=https://your-api-domain.com` in Vercel settings.

---

### Issue: CORS errors in browser console

**Cause**: Backend not configured to accept requests from Vercel domain.

**Solution**: Update Django `CORS_ALLOWED_ORIGINS` to include your Vercel URL.

---

### Issue: Images not loading

**Cause**: External image domain not whitelisted.

**Solution**: Add domain to `next.config.js` `images.remotePatterns`.

---

### Issue: Build fails with TypeScript errors

**Cause**: Type errors in code.

**Solution**: 
1. Run `npm run type-check` locally
2. Fix all TypeScript errors
3. If blocking deployment urgently, temporarily set in `next.config.js`:
   ```js
   typescript: { ignoreBuildErrors: true }
   ```

---

### Issue: Function timeout (504 errors)

**Cause**: API route or page taking > 30 seconds.

**Solution**:
1. Optimize slow database queries
2. Add caching
3. Use streaming for large responses
4. Increase timeout in `vercel.json` (max 60s for Pro plan)

---

## 8️⃣ Performance Optimization

### Enabled Optimizations ✅

- [x] Image optimization with AVIF/WebP
- [x] Font optimization with `next/font`
- [x] Static asset caching (1 year)
- [x] Security headers
- [x] React Strict Mode

### Recommended Additional Steps

1. **Enable Vercel Analytics**
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Enable Speed Insights**
   - Go to Project Settings → Speed Insights
   - Enable Real Experience Score

3. **Configure Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update `NEXT_PUBLIC_SITE_URL` to match

---

## 9️⃣ Security Checklist

| Security Measure | Status |
|-----------------|--------|
| HTTPS enforced | ✅ (Vercel default) |
| Security headers configured | ✅ |
| No secrets in client code | ✅ |
| CORS properly configured | ⚠️ Requires backend setup |
| CSP headers | ⬜ Optional enhancement |

---

## 🔟 Monitoring & Maintenance

### Recommended Monitoring

1. **Vercel Dashboard**
   - Monitor deployments
   - View build logs
   - Check function invocations

2. **Sentry** (if configured)
   - Error tracking
   - Performance monitoring

3. **Google Analytics** (if configured)
   - User analytics
   - Page views

### Regular Maintenance

- Keep dependencies updated
- Monitor build times
- Review error logs weekly
- Check security advisories

---

## 📋 Final Verification Checklist

Before going live, verify:

- [ ] All environment variables set in Vercel
- [ ] Backend CORS configured for Vercel domain
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All pages load correctly
- [ ] API calls work (services, appointments, etc.)
- [ ] Admin login functional
- [ ] Booking flow complete end-to-end
- [ ] Mobile responsive design works
- [ ] SEO metadata present
- [ ] Analytics tracking (if enabled)

---

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify environment variables are set correctly
4. Check backend logs for API errors
5. Review this guide for common solutions

---

**Last Updated**: January 2026
**Next.js Version**: 14.2.35
**Node.js Version**: >=18.17.0
