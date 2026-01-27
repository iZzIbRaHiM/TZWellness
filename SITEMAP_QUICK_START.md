# 🎯 SITEMAP QUICK START GUIDE
## TZ Wellness Centre - Immediate Action Steps

---

## ✅ WHAT WAS FIXED

### 1. Corrected Domain URLs
- ❌ **Before:** `https://tz-wellness-health.vercel.app`
- ✅ **After:** `https://tzwellnesscentre.com`

### 2. Optimized SEO Priorities
- Homepage: 1.0 (highest)
- About/Services Index: 0.9
- Service Details: 0.8
- Appointments: 0.8
- Blog/Events Index: 0.7
- Event Details: 0.7
- Blog Posts: 0.6
- Utility Pages: 0.5

### 3. Enhanced Robots.txt
- Added wildcards for admin routes (`/admin/*`)
- Added API route blocking (`/api/*`)
- Properly references sitemap URL

---

## 🚀 DEPLOY NOW (3 Steps)

### Step 1: Set Production Environment Variable

**In Vercel Dashboard:**
```
Settings → Environment Variables → Add New

Name: NEXT_PUBLIC_SITE_URL
Value: https://tzwellnesscentre.com
Environment: Production
```

### Step 2: Deploy

```powershell
cd frontend
vercel --prod
```

### Step 3: Verify & Submit

**Test URLs (after deployment):**
```
https://tzwellnesscentre.com/sitemap.xml
https://tzwellnesscentre.com/robots.txt
```

**Submit to Google:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate: **Indexing → Sitemaps**
3. Enter: `https://tzwellnesscentre.com/sitemap.xml`
4. Click **Submit**

---

## 📊 EXPECTED RESULTS

### Sitemap Will Include:
- ✅ Homepage
- ✅ About page
- ✅ Services index + all service detail pages
- ✅ Appointments page
- ✅ Blog index + all published blog posts
- ✅ Events index + all active events

### Sitemap Will Exclude:
- ❌ Admin dashboard
- ❌ Admin login
- ❌ API endpoints
- ❌ Unpublished content
- ❌ Inactive services/events

---

## 🔍 VALIDATION

### Google Search Console (After Submission)

**Expected:**
- Status: ✅ Success
- Discovered URLs: 10-50+
- Errors: 0

**Timeline:**
- Initial crawl: 1-3 days
- Full indexing: 1-2 weeks

---

## 📁 MODIFIED FILES

```
frontend/src/app/sitemap.ts      ← Updated domain & priorities
frontend/src/app/robots.ts       ← Updated domain & exclusions
```

---

## 🆘 TROUBLESHOOTING

### Sitemap shows old domain?
→ Set `NEXT_PUBLIC_SITE_URL` in Vercel production environment

### Dynamic pages missing?
→ Check Supabase environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Sitemap returns 404?
→ Run `npm run build` and redeploy

---

## 📚 FULL DOCUMENTATION

See complete audit report: `SITEMAP_SEO_AUDIT_REPORT.md`

---

**Status:** ✅ READY TO DEPLOY  
**Last Updated:** January 27, 2026
