-- ============================================
-- QUICK RLS VERIFICATION & FIX
-- Run this to check and fix RLS status
-- ============================================

-- Step 1: Check current RLS status
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'service_categories', 'services', 'weekly_availability', 'exception_dates',
        'appointments', 'blog_categories', 'blog_tags', 'blog_posts', 'blog_post_tags',
        'event_categories', 'events', 'event_registrations', 'activity_logs',
        'resource_categories', 'resources'
    )
ORDER BY tablename;

-- Step 2: Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Step 3: Identify tables WITHOUT policies
SELECT tablename
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'service_categories', 'services', 'weekly_availability', 'exception_dates',
        'appointments', 'blog_categories', 'blog_tags', 'blog_posts', 'blog_post_tags',
        'event_categories', 'events', 'event_registrations', 'activity_logs',
        'resource_categories', 'resources'
    )
    AND tablename NOT IN (
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
    );

-- Step 4: Check if is_admin() function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'is_admin';

-- Step 5: Test is_admin() function (if logged in)
SELECT is_admin() as am_i_admin;

-- Step 6: List admin users
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'admin';

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- Step 1: All tables should show "✅ ENABLED"
-- Step 2: Each table should have 2-3 policies
-- Step 3: No results (all tables have policies)
-- Step 4: Should return 'is_admin'
-- Step 5: Should return true for admin, false for others
-- Step 6: List of admin users
-- ============================================
