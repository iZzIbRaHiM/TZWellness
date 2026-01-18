-- ============================================
-- TZ WELLNESS - ADMIN SECURITY HARDENING
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR
-- ============================================
-- This script implements strict admin-only access control
-- with proper RLS policies and activity logging
-- ============================================

-- 1. CREATE ADMIN_USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Only super_admins can modify admin_users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- 2. CREATE ADMIN_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
  ON admin_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Only admins can insert settings
CREATE POLICY "Admins can create settings"
  ON admin_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES
  ('maintenance_mode', '{"enabled": false}'::jsonb, 'Site maintenance mode'),
  ('blog_visibility', '{"public": true}'::jsonb, 'Blog section visibility'),
  ('event_visibility', '{"public": true}'::jsonb, 'Events section visibility'),
  ('appointments_enabled', '{"enabled": true}'::jsonb, 'Appointment booking enabled')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. ENHANCED ACTIVITY_LOGS TABLE
-- ============================================
DROP TABLE IF EXISTS activity_logs CASCADE;

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'login', 'logout', 'create', 'update', 'delete', 'publish', 'unpublish', 'archive'
  )),
  entity_type TEXT CHECK (entity_type IN (
    'blog_post', 'blog_category', 'event', 'event_category', 'appointment', 
    'service', 'service_category', 'settings', 'admin_user'
  )),
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs
CREATE POLICY "Admins can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Admins can create logs (for their own actions)
CREATE POLICY "Admins can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action_type);

-- 4. UPDATE EXISTING TABLE RLS POLICIES
-- ============================================

-- BLOG_POSTS: Replace weak policies
DROP POLICY IF EXISTS "Public blog posts are viewable" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can manage blog" ON blog_posts;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins have full access to blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- BLOG_CATEGORIES: Add RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- EVENTS: Replace weak policies
DROP POLICY IF EXISTS "Public events are viewable" ON events;
DROP POLICY IF EXISTS "Authenticated can manage events" ON events;

CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins have full access to events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- EVENT_CATEGORIES: Add RLS
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view event categories"
  ON event_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event categories"
  ON event_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- SERVICES: Replace weak policies
DROP POLICY IF EXISTS "Public services are viewable" ON services;
DROP POLICY IF EXISTS "Authenticated can manage services" ON services;

CREATE POLICY "Public can view published services"
  ON services FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins have full access to services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- SERVICE_CATEGORIES: Add RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view service categories"
  ON service_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage service categories"
  ON service_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- APPOINTMENTS: Strengthen policies
DROP POLICY IF EXISTS "Authenticated can update appointments" ON appointments;

CREATE POLICY "Admins can manage appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- WEEKLY_AVAILABILITY: Add RLS
ALTER TABLE weekly_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view availability"
  ON weekly_availability FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage availability"
  ON weekly_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- EXCEPTION_DATES: Add RLS
ALTER TABLE exception_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view exception dates"
  ON exception_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exception dates"
  ON exception_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- EVENT_REGISTRATIONS: Add RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view event registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage event registrations"
  ON event_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- 5. HELPER FUNCTION TO CHECK ADMIN ROLE
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION TO LOG ADMIN ACTIVITY
-- ============================================
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    admin_id,
    action_type,
    entity_type,
    entity_id,
    description,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_entity_type,
    p_entity_id,
    COALESCE(p_description, p_action_type || ' ' || COALESCE(p_entity_type, '')),
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCTION TO UPDATE LAST LOGIN
-- ============================================
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_users
  SET last_login_at = NOW()
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER TO AUTO-LOG ADMIN LOGIN
-- ============================================
CREATE OR REPLACE FUNCTION auto_log_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the user is an admin
  IF EXISTS (SELECT 1 FROM admin_users WHERE id = NEW.id AND is_active = true) THEN
    INSERT INTO activity_logs (admin_id, action_type, description, metadata)
    VALUES (
      NEW.id,
      'login',
      'Admin logged in',
      jsonb_build_object(
        'email', NEW.email,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETE!
-- ============================================
-- 
-- Next steps:
-- 1. Create your first admin user:
--    a. Supabase Dashboard → Authentication → Users → Add User
--    b. Copy the User UUID
--    c. Run: 
--       INSERT INTO admin_users (id, email, full_name, role, is_active)
--       VALUES ('PASTE_UUID_HERE', 'admin@tzwellness.com', 'Super Admin', 'super_admin', true);
--
-- 2. Test RLS policies:
--    - Try accessing tables with non-admin user (should be denied)
--    - Try accessing with admin user (should work)
--
-- 3. Deploy frontend code with AdminAuthProvider
--
-- ============================================
