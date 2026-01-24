-- =====================================================
-- MAKE YOUR CURRENT USER AN ADMIN
-- =====================================================
-- This will add admin role to tzwelnesshealth@gmail.com
-- =====================================================

-- Update your user (9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7) to have admin role
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE id = '9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7'
AND email = 'tzwelnesshealth@gmail.com';

-- =====================================================
-- VERIFICATION (READ-ONLY)
-- =====================================================

-- Check if update worked
SELECT 
    '=== VERIFICATION ===' as section,
    id,
    email,
    raw_app_meta_data as app_metadata,
    raw_app_meta_data->>'role' as role_value,
    CASE 
        WHEN raw_app_meta_data->>'role' = 'admin' THEN '✅ SUCCESS - You are now admin!'
        ELSE '❌ FAILED - Still not admin'
    END as status
FROM auth.users 
WHERE id = '9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7';

-- Test is_admin() function
SELECT 
    '=== FUNCTION TEST ===' as section,
    public.is_admin() as function_result,
    CASE 
        WHEN public.is_admin() = true THEN '✅ is_admin() returns TRUE - Admin panel will work!'
        ELSE '❌ is_admin() still returns FALSE'
    END as status;

-- Count admin users
SELECT 
    '=== ADMIN COUNT ===' as section,
    COUNT(*) FILTER (WHERE raw_app_meta_data->>'role' = 'admin') as total_admin_users,
    CASE 
        WHEN COUNT(*) FILTER (WHERE raw_app_meta_data->>'role' = 'admin') >= 2 
        THEN '✅ Multiple admin users configured'
        ELSE '⚠️ Only one admin user'
    END as status
FROM auth.users;
