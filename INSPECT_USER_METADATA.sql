-- =====================================================
-- INSPECT ADMIN USER METADATA
-- =====================================================

-- Show EVERYTHING about your user
SELECT 
    '=== YOUR USER FULL DATA ===' as section,
    id,
    email,
    raw_app_meta_data as full_app_metadata,
    raw_user_meta_data as full_user_metadata,
    created_at,
    updated_at
FROM auth.users 
WHERE id = auth.uid();

-- Check ALL users with admin role (if any)
SELECT 
    '=== ALL ADMIN USERS ===' as section,
    id,
    email,
    raw_app_meta_data
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin';

-- Count total users
SELECT 
    '=== USER COUNT ===' as section,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE raw_app_meta_data->>'role' = 'admin') as admin_users
FROM auth.users;
