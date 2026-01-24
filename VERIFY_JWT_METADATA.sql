-- =====================================================
-- JWT TOKEN METADATA VERIFICATION
-- =====================================================
-- Check what's actually in your JWT vs database
-- RUN THIS WHILE LOGGED IN AS ADMIN
-- =====================================================

-- 1. Check what's in auth.jwt() token
SELECT 
    '=== YOUR JWT TOKEN CONTENT ===' as section,
    auth.jwt() as full_jwt_token,
    auth.jwt() -> 'app_metadata' as app_metadata_in_jwt,
    auth.jwt() -> 'app_metadata' ->> 'role' as role_from_jwt,
    auth.jwt() -> 'user_metadata' as user_metadata_in_jwt;

-- 2. Check what's in the database
SELECT 
    '=== DATABASE STORED METADATA ===' as section,
    id,
    email,
    raw_app_meta_data as app_metadata_in_db,
    raw_app_meta_data->>'role' as role_from_db,
    raw_user_meta_data as user_metadata_in_db
FROM auth.users 
WHERE id = auth.uid();

-- 3. Compare both
SELECT 
    '=== COMPARISON ===' as section,
    CASE 
        WHEN auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
        THEN '✅ JWT has admin role'
        ELSE '❌ JWT does NOT have admin role'
    END as jwt_check,
    CASE 
        WHEN (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
        THEN '✅ Database has admin role'
        ELSE '❌ Database does NOT have admin role'
    END as db_check;

-- 4. Test current is_admin() function
SELECT 
    '=== CURRENT FUNCTION TEST ===' as section,
    public.is_admin() as current_function_result,
    CASE 
        WHEN public.is_admin() = true THEN '✅ Function works!'
        WHEN public.is_admin() = false THEN '❌ Function returns FALSE'
        ELSE '❓ Function returns NULL'
    END as status;
