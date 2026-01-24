-- =====================================================
-- CHECK IF FUNCTION WAS UPDATED
-- =====================================================

-- 1. Check the current function code
SELECT 
    '=== CURRENT FUNCTION CODE ===' as section,
    prosrc as function_code
FROM pg_proc
WHERE proname = 'is_admin'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Test the function directly
SELECT 
    '=== FUNCTION TEST ===' as section,
    public.is_admin() as function_result,
    auth.uid() as your_user_id;

-- 3. Check what should be returned
SELECT 
    '=== DATABASE CHECK ===' as section,
    id,
    email,
    raw_app_meta_data->>'role' as role_in_database,
    CASE 
        WHEN raw_app_meta_data->>'role' = 'admin' THEN 'Should return TRUE'
        ELSE 'Should return FALSE'
    END as expected_result
FROM auth.users 
WHERE id = auth.uid();

-- 4. Direct test of what the fixed function should do
SELECT 
    '=== DIRECT TEST ===' as section,
    (SELECT raw_app_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid()) as direct_check,
    CASE 
        WHEN (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
        THEN '✅ You ARE admin in database'
        ELSE '❌ You are NOT admin in database'
    END as status;
