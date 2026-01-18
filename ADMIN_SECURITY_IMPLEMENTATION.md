# 🔐 TZ WELLNESS ADMIN SECURITY - COMPLETE IMPLEMENTATION GUIDE

## ⚠️ CRITICAL: SECURITY AUDIT FINDINGS

### CURRENT VULNERABILITIES
1. ❌ **Session Persistence Bug**: Admin logged in once, never asked again
2. ❌ **Weak RLS Policies**: `auth.role() = 'authenticated'` allows ANY authenticated user admin access
3. ❌ **Missing Role Verification**: No database-level admin role check
4. ❌ **No Activity Logging**: Admin actions not tracked
5. ❌ **Missing Settings Section**: No admin configuration management
6. ❌ **Incomplete CRUD**: Blogs/Events cannot be edited or deleted
7. ❌ **No Logout Protection**: Back button can restore access
8. ❌ **Client-Side Auth**: Session validation only on mount, not per-request

---

## 🎯 IMPLEMENTATION ORDER

Execute in this exact sequence:

### PHASE 1: DATABASE SECURITY (CRITICAL)
**File**: `supabase-admin-security.sql`
- Create `admin_users` table with role verification
- Create `admin_settings` table
- Enhanced `activity_logs` table
- **STRICT RLS POLICIES** for admin-only access
- Remove weak policies that use `auth.role() = 'authenticated'`

### PHASE 2: AUTH INFRASTRUCTURE
- `AdminAuthProvider` context with real-time session monitoring
- `useAdminAuth` hook with automatic logout on session expiry
- Enhanced middleware with database role verification
- Secure logout with complete session invalidation

### PHASE 3: UI COMPONENTS
- Admin Settings page (NEW)
- Recent Activities full page (NEW)
- Edit/Delete for Blogs
- Edit/Delete for Events
- Delete for Appointments
- Activity logging integration

### PHASE 4: VALIDATION & TESTING
- Test logout → back button (should require login)
- Test direct URL access without session
- Test RLS policies with non-admin users
- Verify activity logging for all actions

---

## 📋 SQL SCRIPT TO RUN FIRST

**File**: Create `supabase-admin-security.sql` and run in Supabase SQL Editor

```sql
-- ============================================
-- TZ WELLNESS - ADMIN SECURITY HARDENING
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR
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
  );

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES
  ('maintenance_mode', '{"enabled": false}'::jsonb, 'Site maintenance mode'),
  ('blog_visibility', '{"public": true}'::jsonb, 'Blog section visibility'),
  ('event_visibility', '{"public": true}'::jsonb, 'Events section visibility')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. ENHANCED ACTIVITY_LOGS TABLE
-- ============================================
DROP TABLE IF EXISTS activity_logs CASCADE;

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'login', 'logout', 'create', 'update', 'delete', 'publish', 'unpublish'
  )),
  entity_type TEXT CHECK (entity_type IN (
    'blog_post', 'event', 'appointment', 'service', 'settings', 'user'
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

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

-- APPOINTMENTS: Strengthen policies
DROP POLICY IF EXISTS "Authenticated can update appointments" ON appointments;

CREATE POLICY "Admins can manage appointments"
  ON appointments FOR ALL
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

-- ============================================
-- COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create your first admin user in Supabase Dashboard:
--    Authentication > Users > Add User
--    Then run: INSERT INTO admin_users (id, email, full_name, role) VALUES ('USER_UUID', 'admin@tzwellness.com', 'Admin', 'super_admin');
--
-- 2. Test RLS policies by trying to access data with non-admin user
--
-- 3. Deploy frontend code with AdminAuthProvider
-- ============================================
```

---

## 🔑 CREATE FIRST ADMIN USER

After running the SQL script:

1. **Supabase Dashboard** → Authentication → Users
2. **Add User** manually:
   - Email: `admin@tzwellness.com`
   - Password: (set secure password)
   - Confirm Email: ✅

3. **Copy the User UUID**, then run:
```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'PASTE_UUID_HERE',
  'admin@tzwellness.com',
  'Super Admin',
  'super_admin',
  true
);
```

---

## 📁 FILE STRUCTURE

Create these new files:

```
frontend/src/
├── contexts/
│   └── AdminAuthContext.tsx          (NEW)
├── hooks/
│   └── useAdminAuth.ts               (NEW)
├── components/admin/
│   ├── admin-settings.tsx            (NEW)
│   ├── admin-activities.tsx          (NEW)
│   ├── admin-activity-list.tsx       (NEW)
│   └── admin-route-guard.tsx         (NEW)
├── app/admin/
│   ├── settings/
│   │   └── page.tsx                  (NEW)
│   └── activities/
│       └── page.tsx                  (NEW)
└── lib/
    └── admin-activity-logger.ts      (NEW)
```

---

## ⚡ IMPLEMENTATION PRIORITY

### IMMEDIATE (DO FIRST):
1. ✅ Run `supabase-admin-security.sql`
2. ✅ Create first admin user
3. ✅ Test RLS policies

### HIGH PRIORITY:
4. Create AdminAuthProvider with session monitoring
5. Update middleware with admin_users check
6. Add logout functionality with session clearing
7. Add activity logging to all admin actions

### MEDIUM PRIORITY:
8. Create Admin Settings page
9. Add edit/delete to Blogs CMS
10. Add edit/delete to Events CMS
11. Add delete to Appointments

### LOW PRIORITY:
12. Create full Activities page
13. Add IP logging and user agent tracking
14. Add admin profile editor
15. Add password change functionality

---

## 🧪 TESTING CHECKLIST

After implementation, verify:

- [ ] **Logout Test**: Logout → Back button → Should require login
- [ ] **Direct URL**: Visit `/admin` without session → Redirects to `/admin/login`
- [ ] **Session Expiry**: Wait for token expiry → Auto-logout
- [ ] **RLS Test**: Try accessing admin tables with non-admin user → Denied
- [ ] **Activity Logging**: Perform admin action → Verify log entry created
- [ ] **Settings**: Change setting → Persists after refresh
- [ ] **CRUD Operations**: Create/Edit/Delete blog → All work + logged
- [ ] **No Console Errors**: All pages load without errors

---

## 📞 SUPPORT

If you need help implementing any specific component, ask for:
- "Create AdminAuthProvider"
- "Create Admin Settings page"
- "Add blog edit/delete"
- "Create activity logger"

Each can be generated individually.
