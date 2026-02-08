-- =====================================================
-- DETAILED POLICY INSPECTION
-- =====================================================
-- Check exact policy definitions causing 403 errors
-- =====================================================

-- Show all policies on admin-critical tables with FULL details
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual as using_clause,
    with_check as check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('activity_logs', 'services', 'blog_posts', 'events', 'admin_settings')
ORDER BY tablename, cmd;

-- Check if policies actually allow admin operations
SELECT 
    '=== TESTING ACTUAL POLICY EXECUTION ===' as test,
    tablename,
    policyname,
    CASE 
        WHEN qual IS NULL AND with_check IS NULL THEN '❌ NO CONDITIONS (should not happen)'
        WHEN qual LIKE '%is_admin()%' THEN '✅ Uses is_admin()'
        WHEN qual LIKE '%app_metadata%' THEN '✅ Uses app_metadata'
        WHEN qual = 'true' THEN '⚠️ Always allows (check context)'
        ELSE '❓ Other: ' || COALESCE(qual, with_check, 'null')
    END as policy_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'activity_logs';

-- Test if is_admin() function works correctly
SELECT 
    '=== TEST is_admin() FUNCTION ===' as test,
    public.is_admin() as is_admin_result,
    auth.uid() as current_user_id,
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) as metadata_role,
    CASE 
        WHEN public.is_admin() = true THEN '✅ Function returns TRUE'
        WHEN public.is_admin() = false THEN '❌ Function returns FALSE - policy will block you!'
        ELSE '❓ Function returns NULL'
    END as function_status;

-- Check the is_admin() function definition
SELECT 
    '=== is_admin() FUNCTION CODE ===' as section,
    prosrc as function_code,
    provolatile as volatility,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'is_admin'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
