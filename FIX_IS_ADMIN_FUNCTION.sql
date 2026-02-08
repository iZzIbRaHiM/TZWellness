-- =====================================================
-- FIX is_admin() FUNCTION
-- =====================================================
-- Root cause: Function reads from JWT token which doesn't 
-- include app_metadata by default in Supabase.
-- 
-- Solution: Read directly from auth.users table instead.
-- =====================================================

-- Drop and recreate the is_admin() function with correct implementation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Read app_metadata directly from database (not JWT)
  -- This is secure because:
  -- 1. SECURITY DEFINER gives function elevated privileges
  -- 2. app_metadata in auth.users cannot be modified by users
  -- 3. Only server/admin can modify app_metadata
  RETURN (
    SELECT COALESCE(
      (raw_app_meta_data->>'role') = 'admin',
      FALSE
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- =====================================================
-- VERIFICATION QUERIES (READ-ONLY)
-- =====================================================
-- Run these to confirm the fix works
-- =====================================================

-- Test 1: Check function returns TRUE for admin
SELECT 
    '=== TEST 1: Function Result ===' as test,
    public.is_admin() as result,
    CASE 
        WHEN public.is_admin() = true THEN '✅ SUCCESS - Function returns TRUE'
        WHEN public.is_admin() = false THEN '❌ FAILED - Still returns FALSE'
        ELSE '❓ ERROR - Returns NULL'
    END as status;

-- Test 2: Verify admin user metadata
SELECT 
    '=== TEST 2: Admin User Check ===' as test,
    id,
    email,
    raw_app_meta_data->>'role' as role_in_db,
    CASE 
        WHEN raw_app_meta_data->>'role' = 'admin' THEN '✅ Database has admin role'
        ELSE '❌ No admin role in database'
    END as db_status
FROM auth.users 
WHERE id = auth.uid();

-- Test 3: Check if policies will allow operations
SELECT 
    '=== TEST 3: Policy Check ===' as test,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%is_admin()%' OR with_check LIKE '%is_admin()%' 
        THEN '✅ Policy uses is_admin() - should work now'
        ELSE '⚠️ Policy does not use is_admin()'
    END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('activity_logs', 'services', 'blog_posts', 'events')
AND (qual LIKE '%admin%' OR with_check LIKE '%admin%')
ORDER BY tablename, cmd;

-- Test 4: Final confirmation
SELECT 
    '=== TEST 4: Ready for Production ===' as test,
    CASE 
        WHEN public.is_admin() = true 
        THEN '✅ READY - Admin panel should work now!'
        ELSE '❌ NOT READY - Check previous tests for issues'
    END as final_status;
