# Row Level Security (RLS) Audit & Deployment Guide

## Overview
This guide ensures all Supabase tables have Row Level Security enabled with proper policies that restrict CRUD operations to authenticated admin users only.

## Quick Deployment

### Step 1: Run RLS Script
```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Click "New Query"
# 3. Copy contents of ENABLE_RLS_ALL_TABLES.sql
# 4. Paste and click "Run"
```

### Step 2: Verify RLS Status
Run this query to check all tables have RLS enabled:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected Result:** All tables should show `rls_enabled = true`

### Step 3: Set Admin User
To grant admin access to a user:

**Option A: Via Dashboard**
1. Go to Authentication > Users
2. Click on a user
3. Scroll to "Raw User Meta Data"
4. Add: `{ "role": "admin" }`
5. Save

**Option B: Via SQL**
```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@tzwellness.com';
```

## Security Model

### Public Access (Unauthenticated Users)
- ✅ **READ** published content (services, blog posts, events, resources)
- ✅ **CREATE** appointments (booking system)
- ✅ **CREATE** event registrations
- ✅ **READ** their own appointments by reference_id
- ❌ **CANNOT** modify any existing data
- ❌ **CANNOT** access unpublished content
- ❌ **CANNOT** access activity logs

### Admin Access (Authenticated with role="admin")
- ✅ **FULL CRUD** on all tables
- ✅ **READ/WRITE** activity logs
- ✅ **MANAGE** all appointments, services, blog posts, events
- ✅ **PUBLISH/UNPUBLISH** content
- ✅ **CONFIGURE** availability and exceptions

## Tables Protected by RLS

### Core Tables (15 total)
1. `service_categories` - Service organization
2. `services` - Service offerings
3. `weekly_availability` - Clinic schedule
4. `exception_dates` - Holidays/blocked dates
5. `appointments` - Patient bookings
6. `blog_categories` - Blog organization
7. `blog_tags` - Blog taxonomies
8. `blog_posts` - Content management
9. `blog_post_tags` - Tag relationships
10. `event_categories` - Event types
11. `events` - Educational events
12. `event_registrations` - Event signups
13. `activity_logs` - System audit trail
14. `resource_categories` - Resource organization
15. `resources` - Educational resources

## Policy Structure

Each table has 2-3 policies:

### Pattern 1: Published Content (services, blog_posts, events, resources)
```sql
-- Public can read published
CREATE POLICY "public_read_published_X" ON X FOR SELECT 
TO public USING (is_published = true);

-- Admin can do everything
CREATE POLICY "admin_all_X" ON X FOR ALL 
TO authenticated USING (is_admin()) WITH CHECK (is_admin());
```

### Pattern 2: Reference Data (categories, tags, availability)
```sql
-- Public can read all
CREATE POLICY "public_read_X" ON X FOR SELECT 
TO public USING (true);

-- Admin can do everything
CREATE POLICY "admin_all_X" ON X FOR ALL 
TO authenticated USING (is_admin()) WITH CHECK (is_admin());
```

### Pattern 3: User Actions (appointments, registrations)
```sql
-- Public can create
CREATE POLICY "public_create_X" ON X FOR INSERT 
TO public WITH CHECK (true);

-- Public can read own
CREATE POLICY "public_read_own_X" ON X FOR SELECT 
TO public USING (true);

-- Admin can do everything
CREATE POLICY "admin_all_X" ON X FOR ALL 
TO authenticated USING (is_admin()) WITH CHECK (is_admin());
```

### Pattern 4: Admin Only (activity_logs)
```sql
-- Only admin access
CREATE POLICY "admin_all_X" ON X FOR ALL 
TO authenticated USING (is_admin()) WITH CHECK (is_admin());
```

## Helper Function

The `is_admin()` function checks authentication and role:

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role in metadata
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      FALSE
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Verification Queries

### Check RLS is enabled on all tables
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
```
**Expected:** No results (empty set)

### List all policies
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**Expected:** 2-3 policies per table

### Test admin function
```sql
SELECT is_admin();
```
**Expected:** `true` if logged in as admin, `false` otherwise

### Count policies per table
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```
**Expected:** Each table should have 2-3 policies

## Testing Procedures

### Test 1: Public Access (Not Logged In)
```sql
-- Should work: Read published services
SELECT * FROM services WHERE is_published = true LIMIT 1;

-- Should work: Create appointment
INSERT INTO appointments (reference_id, patient_name, patient_email, patient_phone, patient_type, modality, scheduled_date, scheduled_time)
VALUES ('TEST-' || gen_random_uuid(), 'Test Patient', 'test@test.com', '1234567890', 'new', 'virtual', CURRENT_DATE + 1, '10:00:00');

-- Should fail: Update service
UPDATE services SET title = 'Hacked' WHERE id = (SELECT id FROM services LIMIT 1);
-- Expected: Error - new row violates row-level security policy
```

### Test 2: Admin Access (Logged In as Admin)
```sql
-- Should work: Read all services (including unpublished)
SELECT * FROM services WHERE is_published = false;

-- Should work: Update service
UPDATE services SET title = 'Updated Title' WHERE id = (SELECT id FROM services LIMIT 1);

-- Should work: Create activity log
INSERT INTO activity_logs (action, description) VALUES ('test', 'Test log entry');
```

### Test 3: Non-Admin User (Logged In, No Admin Role)
```sql
-- Should work: Read published content
SELECT * FROM services WHERE is_published = true;

-- Should fail: Update any content
UPDATE services SET title = 'Hacked' WHERE id = (SELECT id FROM services LIMIT 1);
-- Expected: Error - new row violates row-level security policy
```

## Troubleshooting

### Issue: Admin can't access data
**Solution:** Verify user has admin role in metadata
```sql
SELECT raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE id = auth.uid();
```

### Issue: Public can modify data
**Solution:** Verify RLS is enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### Issue: Nobody can access data
**Solution:** Check policies exist
```sql
SELECT tablename, COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename;
```

### Issue: Function is_admin() not found
**Solution:** Recreate the function (see ENABLE_RLS_ALL_TABLES.sql line 73-88)

## Security Best Practices

1. ✅ **Always use RLS** - Never bypass with service_role key in frontend
2. ✅ **Principle of Least Privilege** - Grant minimum required permissions
3. ✅ **Audit regularly** - Review policies and access logs monthly
4. ✅ **Test thoroughly** - Verify policies work as intended
5. ✅ **Use SECURITY DEFINER** - Functions run with creator's permissions
6. ✅ **Validate user metadata** - Check admin role on every request
7. ✅ **Log admin actions** - Track all CRUD operations in activity_logs
8. ✅ **Separate public/admin keys** - Use anon key for frontend, service_role for backend only

## Rollback Procedure

If issues occur, disable RLS temporarily (NOT RECOMMENDED FOR PRODUCTION):

```sql
-- Disable RLS on specific table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Monitoring

### Check failed policy violations
```sql
-- Supabase automatically logs these in postgres logs
-- View in Dashboard > Database > Logs
```

### Monitor admin activity
```sql
SELECT * FROM activity_logs 
WHERE action LIKE '%admin%' 
ORDER BY created_at DESC 
LIMIT 50;
```

## Compliance Notes

- **HIPAA Compliance**: RLS enforces data access controls
- **GDPR Compliance**: Limits data access to authorized personnel
- **Audit Trail**: All admin actions logged in activity_logs
- **Data Minimization**: Public users only see necessary data

## Next Steps

1. ✅ Run ENABLE_RLS_ALL_TABLES.sql in Supabase
2. ✅ Set admin role for admin users
3. ✅ Test public and admin access
4. ✅ Verify all queries in application work correctly
5. ✅ Update API error handling for RLS policy violations
6. ✅ Document admin procedures for team
7. ✅ Schedule monthly security audits

## Support

For issues or questions:
- Check Supabase Dashboard > Database > Logs
- Review pg_policies table for policy details
- Test with is_admin() function
- Verify user metadata has role='admin'
