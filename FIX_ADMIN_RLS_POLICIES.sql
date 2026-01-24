-- =====================================================
-- FIX ADMIN RLS POLICIES
-- =====================================================
-- Issue: Current policies check auth.role() = 'authenticated'
-- Problem: This doesn't work for admin operations
-- Solution: Check auth.jwt()->>'role' = 'admin' from app_metadata
-- =====================================================

-- First, create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SERVICES POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated can manage services" ON services;
DROP POLICY IF EXISTS "Public services are viewable" ON services;

-- Recreate with proper admin check
CREATE POLICY "Public can view published services" 
  ON services FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all services" 
  ON services FOR ALL 
  USING (is_admin());

-- =====================================================
-- SERVICE CATEGORIES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view service categories" ON service_categories;
DROP POLICY IF EXISTS "Only authenticated users can manage service categories" ON service_categories;

CREATE POLICY "Public can view service categories" 
  ON service_categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage service categories" 
  ON service_categories FOR ALL 
  USING (is_admin());

-- =====================================================
-- BLOG POSTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated can manage blog" ON blog_posts;
DROP POLICY IF EXISTS "Public blog posts are viewable" ON blog_posts;

CREATE POLICY "Public can view published blog posts" 
  ON blog_posts FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts" 
  ON blog_posts FOR ALL 
  USING (is_admin());

-- =====================================================
-- BLOG CATEGORIES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Only authenticated users can manage blog categories" ON blog_categories;

CREATE POLICY "Public can view blog categories" 
  ON blog_categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog categories" 
  ON blog_categories FOR ALL 
  USING (is_admin());

-- =====================================================
-- BLOG TAGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view blog tags" ON blog_tags;
DROP POLICY IF EXISTS "Only authenticated users can manage blog tags" ON blog_tags;

CREATE POLICY "Public can view blog tags" 
  ON blog_tags FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog tags" 
  ON blog_tags FOR ALL 
  USING (is_admin());

-- =====================================================
-- BLOG POST TAGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view blog post tags" ON blog_post_tags;
DROP POLICY IF EXISTS "Only authenticated users can manage blog post tags" ON blog_post_tags;

CREATE POLICY "Public can view blog post tags" 
  ON blog_post_tags FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog post tags" 
  ON blog_post_tags FOR ALL 
  USING (is_admin());

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated can manage events" ON events;
DROP POLICY IF EXISTS "Public events are viewable" ON events;

CREATE POLICY "Public can view published events" 
  ON events FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all events" 
  ON events FOR ALL 
  USING (is_admin());

-- =====================================================
-- EVENT CATEGORIES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view event categories" ON event_categories;
DROP POLICY IF EXISTS "Only authenticated users can manage event categories" ON event_categories;

CREATE POLICY "Public can view event categories" 
  ON event_categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage event categories" 
  ON event_categories FOR ALL 
  USING (is_admin());

-- =====================================================
-- EVENT REGISTRATIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Only authenticated users can manage event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;

CREATE POLICY "Users can view own registrations" 
  ON event_registrations FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create registrations" 
  ON event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" 
  ON event_registrations FOR ALL 
  USING (is_admin());

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can lookup appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated can update appointments" ON appointments;

CREATE POLICY "Anyone can create appointments" 
  ON appointments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view own appointments" 
  ON appointments FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage all appointments" 
  ON appointments FOR ALL 
  USING (is_admin());

-- =====================================================
-- ACTIVITY LOGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated can create activity logs" ON activity_logs;

CREATE POLICY "Admins can view all activity logs" 
  ON activity_logs FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admins can create activity logs" 
  ON activity_logs FOR INSERT 
  WITH CHECK (is_admin());

-- =====================================================
-- ADMIN SETTINGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Users can insert own admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Users can update own admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin users can view own settings" ON admin_settings;

CREATE POLICY "Admins can view own settings" 
  ON admin_settings FOR SELECT 
  USING (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can insert own settings" 
  ON admin_settings FOR INSERT 
  WITH CHECK (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can update own settings" 
  ON admin_settings FOR UPDATE 
  USING (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can delete own settings" 
  ON admin_settings FOR DELETE 
  USING (is_admin() AND auth.uid() = user_id);

-- =====================================================
-- WEEKLY AVAILABILITY POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view weekly availability" ON weekly_availability;
DROP POLICY IF EXISTS "Only authenticated users can manage weekly availability" ON weekly_availability;

CREATE POLICY "Public can view availability" 
  ON weekly_availability FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage availability" 
  ON weekly_availability FOR ALL 
  USING (is_admin());

-- =====================================================
-- EXCEPTION DATES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view exception dates" ON exception_dates;
DROP POLICY IF EXISTS "Only authenticated users can manage exception dates" ON exception_dates;

CREATE POLICY "Public can view exception dates" 
  ON exception_dates FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage exception dates" 
  ON exception_dates FOR ALL 
  USING (is_admin());

-- =====================================================
-- RESOURCES & RESOURCE CATEGORIES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view resource categories" ON resource_categories;
DROP POLICY IF EXISTS "Only authenticated users can manage resource categories" ON resource_categories;

CREATE POLICY "Public can view resource categories" 
  ON resource_categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage resource categories" 
  ON resource_categories FOR ALL 
  USING (is_admin());

DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can manage resources" ON resources;

CREATE POLICY "Public can view published resources" 
  ON resources FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all resources" 
  ON resources FOR ALL 
  USING (is_admin());

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the is_admin() function
SELECT 
    'Admin Check' as test,
    is_admin() as result,
    auth.uid() as user_id,
    auth.jwt() -> 'app_metadata' ->> 'role' as role;

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
