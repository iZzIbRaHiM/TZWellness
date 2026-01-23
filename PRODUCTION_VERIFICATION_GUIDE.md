# Production Verification Guide
## How to Run Database Validation for TZWellness

**Date:** January 23, 2026  
**Purpose:** Validate database before production deployment  
**Script:** `PRODUCTION_VERIFICATION.sql`

---

## 🚀 Quick Start

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run Verification Script
1. Copy entire contents of `PRODUCTION_VERIFICATION.sql`
2. Paste into SQL Editor
3. Click **RUN** button (or press Ctrl+Enter)
4. Wait 10-30 seconds for results

### Step 3: Review Results
The script outputs 7 result sets - scroll through all of them.

---

## 📊 Understanding the Results

### Result Set 1: Verification Summary by Category

```
category    | total_tests | passed | failed | warnings | info
------------|-------------|--------|--------|----------|------
TABLE       | 14          | 14     | 0      | 0        | 0
RLS         | 14          | 14     | 0      | 0        | 0
POLICY      | 6           | 6      | 0      | 0        | 0
FK          | 15          | 15     | 0      | 0        | 0
...
```

**What to look for:**
- ✅ **PASS** - Everything is correct
- ❌ **FAIL** - Critical issue - must fix before production
- ⚠️ **WARN** - Warning - review but may be acceptable
- ℹ️ **INFO** - Informational only

### Result Set 2: Overall Status

```
total_tests | total_passed | total_failed | total_warnings | production_status
------------|--------------|--------------|----------------|-------------------
120         | 100          | 0            | 5              | ✅ PRODUCTION READY
```

**What you want to see:**
- **total_failed = 0** - CRITICAL
- **production_status = "✅ PRODUCTION READY"** - GOOD TO GO

**If you see failures:**
- DO NOT deploy to production
- Review "Critical Failures" section
- Fix issues and re-run script

### Result Set 3: Critical Failures

Shows only tests with **FAIL** status. This section should be **EMPTY** for production.

**Example failures and how to fix:**

| Issue | Fix |
|-------|-----|
| `Table: admin_settings` missing | Run migration: `20260118000003_create_admin_settings_table.sql` |
| `Admin Users: 0 admin user(s)` | Create admin user (see below) |
| `Orphaned Services: 5 services` | Delete services or create missing categories |

### Result Set 4: Warnings

Shows tests with **WARN** status. Review these but they may be acceptable.

**Common warnings:**

| Warning | Meaning | Action |
|---------|---------|--------|
| Admin Settings Records: No records found | Normal on fresh install | Will auto-create on first admin login |
| Service Categories: 0 categories | No categories yet | Add categories before services |
| RLS not enabled on X table | Might be intentional | Verify if table needs RLS |

### Result Set 5: Detailed Results

Complete list of all tests. Use this for deep debugging.

**Columns:**
- `test_number` - Unique test ID
- `category` - Test category (TABLE, RLS, POLICY, etc.)
- `test_name` - What was tested
- `status` - PASS/FAIL/WARN/INFO
- `details` - Additional information
- `timestamp` - When test ran

### Result Set 6: Production Readiness Checklist

Quick yes/no checklist for production readiness.

```
check_item                  | status
----------------------------|----------
All Tables Exist            | ✅ PASS
RLS Policies Active         | ✅ PASS
Foreign Keys Valid          | ✅ PASS
No Orphaned Records         | ✅ PASS
Admin User Configured       | ✅ PASS
Triggers Active             | ✅ PASS
Storage Configured          | ✅ PASS
```

**All items must be ✅ PASS or ⚠️ CHECK**

If you see **❌ FAIL** on any item, fix before production.

### Result Set 7: Recommendations

Automated recommendations based on what was found.

**Example recommendations:**
```
⚠️ Create service categories before adding services
⚠️ Configure storage buckets for image uploads
✅ All basic requirements met
```

---

## 🔧 Common Issues and Fixes

### Issue: "Admin User Configured: ❌ FAIL"

**Problem:** No admin user exists  
**Impact:** Cannot access admin panel  
**Fix:**

1. Create user via Supabase Dashboard > Authentication > Users
2. Click "Add user" → Email + Password
3. After creation, click on user → "Edit User"
4. Scroll to "User Metadata" section
5. Under "App metadata (raw_app_meta_data)" add:
```json
{
  "role": "admin"
}
```
6. Click "Save"
7. Re-run verification script

### Issue: "Table: admin_settings: FAIL"

**Problem:** admin_settings table doesn't exist  
**Impact:** Settings page will crash  
**Fix:**

1. Go to Supabase SQL Editor
2. Open file: `supabase/migrations/20260118000003_create_admin_settings_table.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Run the migration
6. Re-run verification script

### Issue: "Orphaned Services: 5 services without valid category"

**Problem:** Services reference deleted categories  
**Impact:** May cause errors when loading services  
**Fix Option 1 (Create missing categories):**
```sql
-- Find which categories are missing
SELECT DISTINCT s.category_id, s.name as service_name
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
WHERE sc.id IS NULL;

-- Create missing category (example)
INSERT INTO service_categories (name, slug, description)
VALUES ('General Wellness', 'general-wellness', 'General wellness services');
```

**Fix Option 2 (Delete orphaned services):**
```sql
-- Delete services without valid categories
DELETE FROM services s
WHERE NOT EXISTS (
    SELECT 1 FROM service_categories sc WHERE sc.id = s.category_id
);
```

### Issue: "Storage Buckets: WARN - No storage buckets found"

**Problem:** No storage buckets configured  
**Impact:** Image uploads will fail  
**Fix:**

1. Go to Supabase Dashboard > Storage
2. Click "Create a new bucket"
3. Create these buckets:
   - **Name:** `blog-images`, **Public:** ✅ Yes
   - **Name:** `event-images`, **Public:** ✅ Yes
   - **Name:** `service-images`, **Public:** ✅ Yes
4. Configure upload policies (see Storage Policies section)

### Issue: "Business Hours Configuration: WARN"

**Problem:** Admin settings exist but business_hours is empty  
**Impact:** Business hours tab may not load correctly  
**Fix:**
```sql
-- Update admin_settings with default business hours
UPDATE admin_settings
SET business_hours = '{
  "monday": {"open": "09:00", "close": "17:00", "enabled": true},
  "tuesday": {"open": "09:00", "close": "17:00", "enabled": true},
  "wednesday": {"open": "09:00", "close": "17:00", "enabled": true},
  "thursday": {"open": "09:00", "close": "17:00", "enabled": true},
  "friday": {"open": "09:00", "close": "17:00", "enabled": true},
  "saturday": {"open": "10:00", "close": "14:00", "enabled": false},
  "sunday": {"open": "10:00", "close": "14:00", "enabled": false}
}'::jsonb
WHERE business_hours IS NULL OR business_hours = '{}'::jsonb;
```

---

## ✅ Production Readiness Criteria

### MUST HAVE (Cannot deploy without):
- ✅ All 14 required tables exist
- ✅ RLS enabled on critical tables
- ✅ At least 1 admin user configured
- ✅ No orphaned records (foreign key integrity)
- ✅ Zero FAIL status in verification

### SHOULD HAVE (Deploy with caution):
- ✅ Service categories configured
- ✅ Blog categories configured
- ✅ Event categories configured
- ✅ Storage buckets created
- ✅ Admin settings table has default values

### NICE TO HAVE (Can add post-deployment):
- Sample services
- Sample blog posts
- Sample events
- Testimonials
- FAQs

---

## 🎯 What Each Category Tests

### TABLE (14 tests)
Verifies all required tables exist:
- profiles, service_categories, services
- blog_categories, blog_posts
- event_categories, events, event_registrations
- appointments, admin_settings, activity_logs
- testimonials, faqs, contact_messages

### RLS (14 tests)
Checks Row Level Security is enabled on each table

### POLICY (6 tests)
Verifies critical RLS policies exist:
- Services viewable by everyone
- Blog posts viewable by everyone
- Events viewable by everyone
- Users can view own appointments
- Admin users can view own settings
- Admin users can view all logs

### FK (15+ tests)
Validates all foreign key constraints are properly set up

### TRIGGER (variable)
Lists all database triggers and verifies they're active

### INDEX (variable)
Lists custom indexes for performance optimization

### DATATYPE (variable)
Checks critical columns have correct data types (timestamps, etc.)

### DEFAULT (variable)
Verifies default values are set for important columns

### DATA (12 tests)
Checks for:
- Admin settings records
- Category counts (services, blog, events)
- Appointment status distribution
- Business hours configuration

### INTEGRITY (4 tests)
Checks for orphaned records:
- Services without categories
- Blog posts without categories
- Events without categories
- Appointments without services

### LOGGING (2 tests)
Verifies activity logs are working

### AUTH (3 tests)
Checks:
- Auth users count
- Profiles match auth users
- Admin users configured

### STORAGE (variable)
Lists configured storage buckets

### CONSTRAINT (variable)
Lists check constraints (validation rules)

### CONTENT (3 tests)
Counts published content:
- Published services
- Published blog posts
- Published events

---

## 📋 Pre-Deployment Checklist

Run through this checklist BEFORE deploying:

### Database Setup
- [ ] Run `PRODUCTION_VERIFICATION.sql` in Supabase SQL Editor
- [ ] Verify **0 FAIL** results
- [ ] Review and address all **WARN** results
- [ ] Confirm "✅ PRODUCTION READY" status

### Admin Configuration
- [ ] At least 1 admin user exists with `app_metadata.role = 'admin'`
- [ ] Admin can login at `/admin/login`
- [ ] Admin settings page loads without errors
- [ ] All 5 settings tabs (Profile, Notifications, System, Business Hours, Clinic Info) work

### Categories Setup
- [ ] Create at least 1 service category
- [ ] Create at least 1 blog category
- [ ] Create at least 1 event category

### Storage Setup
- [ ] Create storage buckets: `blog-images`, `event-images`, `service-images`
- [ ] Set buckets to public
- [ ] Configure upload policies

### Content (Optional but Recommended)
- [ ] Add at least 1 published service
- [ ] Add at least 1 published blog post
- [ ] Add at least 1 published event
- [ ] Add clinic information in admin settings

### Frontend Build
- [ ] Run `npm run build` in frontend directory
- [ ] Verify build succeeds with no errors
- [ ] Test admin panel locally
- [ ] Test public pages locally

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly
- [ ] All environment variables configured in production

---

## 🚀 After Verification Passes

Once you see **"✅ PRODUCTION READY"**:

1. **Export your results** (optional):
   - Copy all result sets to a text file
   - Name it: `verification_results_2026-01-23.txt`
   - Keep for documentation

2. **Run final frontend build**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy frontend** (if using Vercel):
   ```bash
   vercel --prod
   ```

4. **Test production deployment**:
   - Visit your production URL
   - Test public pages (services, blog, events)
   - Test user registration/login
   - Test admin login
   - Create test appointment
   - Verify admin panel works

5. **Monitor logs**:
   - Check Supabase Dashboard > Logs
   - Watch for errors in first 24 hours
   - Monitor API usage

---

## 🆘 Support & Troubleshooting

### If verification fails repeatedly:

1. Check migration files are all applied:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
   ```

2. Verify you're running script in correct project

3. Check for syntax errors in script execution

4. Review Supabase logs for errors

5. Start fresh with clean database (CAUTION: deletes all data):
   ```sql
   -- DANGER: This will delete everything!
   -- Only use on development database
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   -- Then re-run all migrations
   ```

### Common Script Errors:

**"relation does not exist"**
- Missing table - run migrations

**"permission denied"**
- Need admin role in Supabase
- Check you're running as postgres role

**"syntax error"**
- Copy/paste entire script at once
- Don't run line by line

---

## 📊 Example Good Result

```
=== OVERALL STATUS ===
total_tests: 98
total_passed: 85
total_failed: 0
total_warnings: 8
total_info: 5
production_status: ✅ PRODUCTION READY

=== CRITICAL FAILURES ===
(empty - no failures)

=== WARNINGS ===
Service Categories: 0 categories found
Blog Categories: 0 categories found  
Event Categories: 0 categories found
(These are acceptable - add categories before content)

=== PRODUCTION READINESS CHECKLIST ===
All Tables Exist            ✅ PASS
RLS Policies Active         ✅ PASS
Foreign Keys Valid          ✅ PASS
No Orphaned Records         ✅ PASS
Admin User Configured       ✅ PASS
Triggers Active             ✅ PASS
Storage Configured          ✅ PASS
```

This is PERFECT for production! The warnings about missing categories are fine - you'll add those through the admin panel.

---

## 🎉 You're Ready!

If your verification results look like the example above, you're ready to deploy to production!

**Final Steps:**
1. ✅ Database verified
2. ✅ Frontend built successfully
3. ✅ Deploy to production
4. ✅ Test live site
5. ✅ Monitor for 24 hours

**Congratulations! Your TZWellness system is production-ready! 🚀**
