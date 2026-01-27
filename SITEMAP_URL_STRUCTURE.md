# 🗺️ SITEMAP URL STRUCTURE
## TZ Wellness Centre - Complete URL Map

**Domain:** https://tzwellnesscentre.com  
**Sitemap URL:** https://tzwellnesscentre.com/sitemap.xml

---

## 📍 COMPLETE URL STRUCTURE

```
https://tzwellnesscentre.com/
├── 📄 sitemap.xml ...................... [AUTO-GENERATED]
├── 📄 robots.txt ....................... [AUTO-GENERATED]
│
├── 🏠 / (Homepage) ..................... Priority: 1.0 | Weekly
│
├── 📖 /about ........................... Priority: 0.9 | Monthly
│
├── 💊 /services ........................ Priority: 0.9 | Weekly
│   ├── /services/{slug-1} ............. Priority: 0.8 | Monthly [DYNAMIC]
│   ├── /services/{slug-2} ............. Priority: 0.8 | Monthly [DYNAMIC]
│   └── /services/{slug-n} ............. Priority: 0.8 | Monthly [DYNAMIC]
│
├── 📅 /appointments .................... Priority: 0.8 | Daily
│   └── /appointments/lookup ........... Priority: 0.5 | Daily
│
├── 📰 /blog ............................ Priority: 0.7 | Weekly
│   ├── /blog/{slug-1} ................. Priority: 0.6 | Monthly [DYNAMIC]
│   ├── /blog/{slug-2} ................. Priority: 0.6 | Monthly [DYNAMIC]
│   └── /blog/{slug-n} ................. Priority: 0.6 | Monthly [DYNAMIC]
│
├── 🎉 /events .......................... Priority: 0.7 | Weekly
│   ├── /events/{slug-1} ............... Priority: 0.7 | Weekly [DYNAMIC]
│   ├── /events/{slug-2} ............... Priority: 0.7 | Weekly [DYNAMIC]
│   └── /events/{slug-n} ............... Priority: 0.7 | Weekly [DYNAMIC]
│
└── 🚫 /admin ........................... [EXCLUDED FROM SITEMAP]
    ├── /admin/login ................... [EXCLUDED FROM SITEMAP]
    └── /admin/* ....................... [BLOCKED IN ROBOTS.TXT]

└── 🚫 /api/* ........................... [BLOCKED IN ROBOTS.TXT]
```

---

## 📊 PRIORITY MATRIX

### Priority 1.0 (Critical - Homepage)
```
https://tzwellnesscentre.com/
```
**Why:** Primary brand entity, highest SEO value

### Priority 0.9 (Very High - Core Pages)
```
https://tzwellnesscentre.com/about
https://tzwellnesscentre.com/services
```
**Why:** Core business information, YMYL content

### Priority 0.8 (High - Service Details & Conversions)
```
https://tzwellnesscentre.com/services/diabetes-reversal
https://tzwellnesscentre.com/services/fatty-liver-treatment
https://tzwellnesscentre.com/appointments
```
**Why:** Medical service pages (high-value), conversion paths

### Priority 0.7 (Medium-High - Content Hubs)
```
https://tzwellnesscentre.com/blog
https://tzwellnesscentre.com/events
https://tzwellnesscentre.com/events/wellness-workshop
```
**Why:** Content indexes and event pages

### Priority 0.6 (Medium - Supporting Content)
```
https://tzwellnesscentre.com/blog/how-to-reverse-diabetes
https://tzwellnesscentre.com/blog/lifestyle-medicine-guide
```
**Why:** Blog posts support expertise signals

### Priority 0.5 (Low - Utility Pages)
```
https://tzwellnesscentre.com/appointments/lookup
```
**Why:** Functional page, lower SEO value

---

## 🔄 CHANGE FREQUENCY STRATEGY

### Daily Updates
```
/appointments
/appointments/lookup
```
**Reason:** High-activity booking system

### Weekly Updates
```
/ (Homepage)
/services (index)
/blog (index)
/events (index)
/events/{slug}
```
**Reason:** Regular content updates, active promotion

### Monthly Updates
```
/about
/services/{slug}
/blog/{slug}
```
**Reason:** Stable content, infrequent changes

---

## 🎯 INDEXABLE VS NON-INDEXABLE

### ✅ INCLUDED IN SITEMAP (Indexable)

**Static Pages:**
- Homepage
- About page
- Services index
- Appointments page
- Appointments lookup
- Blog index
- Events index

**Dynamic Pages (from database):**
- All active services (`is_active = true`)
- All published blog posts (`is_published = true`)
- All active events (`is_active = true`)

**Total Estimated URLs:** 10-50+ (depending on content)

### ❌ EXCLUDED FROM SITEMAP (Non-Indexable)

**Blocked in robots.txt:**
- `/admin` - Admin dashboard
- `/admin/*` - All admin routes
- `/api` - API root
- `/api/*` - All API endpoints

**Never indexed:**
- Login pages
- Authentication routes
- Admin management pages
- API endpoints
- Draft/unpublished content
- Inactive services/events

---

## 🔍 EXAMPLE SITEMAP XML OUTPUT

After deployment, `https://tzwellnesscentre.com/sitemap.xml` will return:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>https://tzwellnesscentre.com/</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- About Page -->
  <url>
    <loc>https://tzwellnesscentre.com/about</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Services Index -->
  <url>
    <loc>https://tzwellnesscentre.com/services</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Example Service Detail -->
  <url>
    <loc>https://tzwellnesscentre.com/services/diabetes-reversal</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Appointments -->
  <url>
    <loc>https://tzwellnesscentre.com/appointments</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog Index -->
  <url>
    <loc>https://tzwellnesscentre.com/blog</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Example Blog Post -->
  <url>
    <loc>https://tzwellnesscentre.com/blog/reverse-diabetes-naturally</loc>
    <lastmod>2026-01-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Events Index -->
  <url>
    <loc>https://tzwellnesscentre.com/events</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Example Event -->
  <url>
    <loc>https://tzwellnesscentre.com/events/wellness-workshop-february</loc>
    <lastmod>2026-01-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Appointment Lookup -->
  <url>
    <loc>https://tzwellnesscentre.com/appointments/lookup</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- ...additional dynamic pages... -->
  
</urlset>
```

---

## 🤖 EXAMPLE ROBOTS.TXT OUTPUT

`https://tzwellnesscentre.com/robots.txt` will return:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

Sitemap: https://tzwellnesscentre.com/sitemap.xml
```

---

## 📈 SEO CRAWL PATH VISUALIZATION

How Google will discover your site:

```
1. Google discovers robots.txt
   └── Reads sitemap URL

2. Google fetches sitemap.xml
   └── Discovers all URLs with priorities

3. Google crawls based on priority:
   ├── Priority 1.0: Homepage (first)
   ├── Priority 0.9: About, Services Index (second)
   ├── Priority 0.8: Service Details, Appointments (third)
   ├── Priority 0.7: Blog/Events Indexes, Event Pages (fourth)
   ├── Priority 0.6: Blog Posts (fifth)
   └── Priority 0.5: Utility Pages (last)

4. Google re-crawls based on changefreq:
   ├── Daily: Appointments
   ├── Weekly: Homepage, Indexes, Events
   └── Monthly: About, Services, Blog Posts
```

---

## 🎯 GOOGLE SEARCH CONSOLE VIEW

After submission, you'll see:

### Sitemaps Report
```
Sitemap: sitemap.xml
Status: ✅ Success
Type: Normal sitemap
Submitted: 2026-01-27
Last read: 2026-01-27
Discovered URLs: 15-50+ (varies by content)
```

### Coverage Report
```
✅ Valid: 15-50+ pages
   - All public pages successfully indexed

⚠️ Excluded: 2-5 pages
   - /admin (intentionally blocked)
   - /admin/login (intentionally blocked)
   - /api/* (intentionally blocked)

❌ Errors: 0 pages
```

---

## 🔗 RELATED FILES

- **Implementation:** `frontend/src/app/sitemap.ts`
- **Robots Config:** `frontend/src/app/robots.ts`
- **Full Audit:** `SITEMAP_SEO_AUDIT_REPORT.md`
- **Quick Start:** `SITEMAP_QUICK_START.md`
- **Changes:** `SITEMAP_CHANGES_SUMMARY.md`
- **Validation:** `validate-sitemap.ps1`

---

## ✅ VERIFICATION COMMANDS

After deployment:

```powershell
# Test sitemap accessibility
Invoke-WebRequest https://tzwellnesscentre.com/sitemap.xml

# Test robots.txt
Invoke-WebRequest https://tzwellnesscentre.com/robots.txt

# Validate with Google
# Visit: https://search.google.com/test/rich-results
```

---

**Last Updated:** January 27, 2026  
**Status:** ✅ PRODUCTION-READY  
**Domain:** https://tzwellnesscentre.com
