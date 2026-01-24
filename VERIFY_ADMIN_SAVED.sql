-- =====================================================
-- VERIFY ADMIN ROLE IS SAVED
-- =====================================================

SELECT 
    '=== YOUR USER IN DATABASE ===' as section,
    id,
    email,
    raw_app_meta_data,
    raw_app_meta_data->>'role' as role_value,
    CASE 
        WHEN raw_app_meta_data->>'role' = 'admin' THEN '✅ Admin role IS saved in database'
        ELSE '❌ Admin role NOT in database'
    END as db_status
FROM auth.users 
WHERE email = 'tzwelnesshealth@gmail.com';

-- Check current session
SELECT 
    '=== YOUR CURRENT SESSION ===' as section,
    auth.uid() as your_session_user_id,
    CASE 
        WHEN auth.uid() = '9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7' 
        THEN '✅ Session matches your user'
        ELSE '❌ Session is different user'
    END as session_status;
