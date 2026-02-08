-- =====================================================
-- ADMIN RLS DIAGNOSTIC SCRIPT
-- =====================================================
-- This script ONLY reads and diagnoses - NO CHANGES
-- Run this first to identify the exact RLS issues
-- =====================================================

-- =====================================================
-- TEST 1: Check Current User Authentication
-- =====================================================
SELECT 
    '=== CURRENT USER INFO ===' as section,
    auth.uid() as user_id,
    auth.role() as jwt_role,
    auth.jwt() as full_jwt;

-- =====================================================
-- TEST 2: Check Admin Metadata
-- =====================================================
SELECT 
    '=== ADMIN USER METADATA ===' as section,
    id,
    email,
    raw_app_meta_data as app_metadata,
    raw_app_meta_data->>'role' as admin_role,
    CASE 
        WHEN raw_app_meta_data->>'role' = 'admin' THEN '✅ HAS ADMIN ROLE'
        ELSE '❌ NO ADMIN ROLE'
    END as admin_status
FROM auth.users
WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- =====================================================
-- TEST 3: List ALL Current RLS Policies
-- =====================================================
SELECT 
    '=== ALL RLS POLICIES ===' as section,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- TEST 4: Check Policies for Admin Tables
-- =====================================================
SELECT 
    '=== ADMIN-CRITICAL TABLE POLICIES ===' as section,
    tablename,
    policyname,
    cmd,
    qual as using_condition,
    with_check,
    CASE 
        WHEN qual LIKE '%auth.role()%' THEN '⚠️ Uses auth.role() (WRONG)'
        WHEN qual LIKE '%app_metadata%' THEN '✅ Uses app_metadata (CORRECT)'
        WHEN qual LIKE '%is_admin%' THEN '✅ Uses is_admin() (CORRECT)'
        WHEN with_check LIKE '%auth.role()%' THEN '⚠️ Uses auth.role() (WRONG)'
        WHEN with_check LIKE '%app_metadata%' THEN '✅ Uses app_metadata (CORRECT)'
        WHEN with_check LIKE '%is_admin%' THEN '✅ Uses is_admin() (CORRECT)'
        ELSE '❓ Other condition'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'services', 'service_categories',
    'blog_posts', 'blog_categories',
    'events', 'event_categories',
    'appointments', 'activity_logs',
    'admin_settings'
)
ORDER BY tablename, cmd;

-- =====================================================
-- TEST 5: Check if is_admin() Function Exists
-- =====================================================
SELECT 
    '=== CHECK is_admin() FUNCTION ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'is_admin' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN '✅ is_admin() function EXISTS'
        ELSE '❌ is_admin() function MISSING - needs to be created'
    END as function_status;

-- =====================================================
-- TEST 6: Test Auth Role vs App Metadata
-- =====================================================
SELECT 
    '=== AUTH CHECK COMPARISON ===' as section,
    auth.role() as jwt_role_returns,
    CASE 
        WHEN auth.role() = 'authenticated' THEN '✅ Returns "authenticated"'
        ELSE '❌ Unexpected: ' || auth.role()
    END as jwt_role_check,
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) as app_metadata_role,
    CASE 
        WHEN (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin' 
        THEN '✅ App metadata shows "admin"'
        ELSE '❌ App metadata does NOT show "admin"'
    END as app_metadata_check,
    CASE 
        WHEN auth.role() = 'authenticated' 
        AND (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
        THEN '🔴 PROBLEM CONFIRMED: Policies use auth.role() but admin is in app_metadata!'
        ELSE '✅ No mismatch detected'
    END as diagnosis;

-- =====================================================
-- TEST 7: Count Broken Policies
-- =====================================================
SELECT 
    '=== POLICY ANALYSIS ===' as section,
    COUNT(*) FILTER (
        WHERE qual LIKE '%auth.role()%' OR with_check LIKE '%auth.role()%'
    ) as policies_using_auth_role,
    COUNT(*) FILTER (
        WHERE qual LIKE '%app_metadata%' OR with_check LIKE '%app_metadata%'
    ) as policies_using_app_metadata,
    COUNT(*) FILTER (
        WHERE qual LIKE '%is_admin%' OR with_check LIKE '%is_admin%'
    ) as policies_using_is_admin,
    COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- =====================================================
-- TEST 8: Check Activity Logs Specific Policy
-- =====================================================
SELECT 
    '=== ACTIVITY LOGS POLICY (causing 403) ===' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual LIKE '%auth.role()%' THEN '🔴 BROKEN: Uses auth.role() instead of admin check'
        ELSE '✅ OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'activity_logs';

-- =====================================================
-- TEST 9: Services Table Policy Check
-- =====================================================
SELECT 
    '=== SERVICES POLICIES (failing CRUD) ===' as section,
    policyname,
    cmd as operation,
    qual as using_clause,
    with_check,
    CASE 
        WHEN cmd = 'SELECT' AND qual = '(is_published = true)' THEN '✅ Public read OK'
        WHEN cmd IN ('INSERT', 'UPDATE', 'DELETE') AND qual LIKE '%auth.role()%' THEN '🔴 BROKEN: Admin ops blocked'
        WHEN cmd = 'ALL' AND qual LIKE '%auth.role()%' THEN '🔴 BROKEN: Admin ops blocked'
        ELSE '❓ Check condition'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'services';

-- =====================================================
-- TEST 10: Simulate Admin Check
-- =====================================================
SELECT 
    '=== SIMULATE ADMIN CHECKS ===' as section,
    auth.role() = 'authenticated' as current_auth_role_check_result,
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin' as correct_admin_check_result,
    CASE 
        WHEN auth.role() = 'authenticated' 
        AND (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
        THEN '🔴 CONFIRMED: Policies will BLOCK admin because they check auth.role() not app_metadata'
        ELSE 'Unable to confirm - not logged in as admin'
    END as final_diagnosis;

-- =====================================================
-- SUMMARY AND RECOMMENDATIONS
-- =====================================================
SELECT 
    '=== DIAGNOSTIC SUMMARY ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND (qual LIKE '%auth.role()%' OR with_check LIKE '%auth.role()%')
        ) THEN '🔴 ISSUE CONFIRMED: Policies use auth.role() which does not check admin metadata'
        ELSE '✅ No issues detected with auth.role() usage'
    END as primary_finding,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'is_admin'
        ) THEN '📋 RECOMMENDATION: Create is_admin() function and update all policies'
        ELSE '✅ is_admin() function already exists'
    END as recommendation;
