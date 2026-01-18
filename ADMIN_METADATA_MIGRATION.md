# Admin Role Metadata Migration Guide

## 🔒 CRITICAL SECURITY FIX

**Issue**: Previous implementation stored admin role in `user_metadata`, which is **client-editable** and vulnerable to privilege escalation attacks.

**Solution**: All admin role checks now use `app_metadata`, which is **server-only** and cannot be modified by users.

---

## ⚠️ Action Required for Existing Admin Users

If you have existing admin users created with the old system, you **MUST** migrate their role from `user_metadata` to `app_metadata`.

### Option 1: Supabase Dashboard (Manual)

1. Go to Supabase Dashboard → Authentication → Users
2. Select your admin user
3. Under "User Metadata" (Raw user meta data), **remove** the `role` field:
   ```json
   {
     "full_name": "Admin Name"
   }
   ```
4. Under "App Metadata" (Raw app meta data), **add** the `role` field:
   ```json
   {
     "role": "admin"
   }
   ```
5. Click "Save"

### Option 2: SQL Command (Recommended)

Run this SQL in Supabase SQL Editor (replace with actual admin email):

```sql
-- Migrate existing admin user from user_metadata to app_metadata
UPDATE auth.users 
SET 
  raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
  raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'your-admin@email.com';
```

### Option 3: Migrate All Admins (Bulk)

If you have multiple admins with `role: "admin"` in `user_metadata`:

```sql
-- Migrate ALL users who have admin role in user_metadata
UPDATE auth.users 
SET 
  raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
  raw_user_meta_data = raw_user_meta_data - 'role'
WHERE raw_user_meta_data->>'role' = 'admin';
```

---

## 🆕 Creating New Admin Users

### Method 1: SQL Command (Recommended)

```sql
-- Create new admin user with app_metadata
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'new-admin@email.com';
```

### Method 2: Supabase Management API

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key required
)

await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' }
})
```

### Method 3: Supabase Dashboard

1. Go to Authentication → Users
2. Select user
3. Under "App Metadata" (Raw app meta data), add:
   ```json
   {
     "role": "admin"
   }
   ```

---

## ✅ Verification

After migration, test that:

1. ✅ Admin can log in at `/admin/login`
2. ✅ Admin can access `/admin` routes
3. ✅ Admin can perform CRUD operations (protected by RLS)
4. ✅ Non-admin users are blocked from admin routes
5. ✅ Users cannot self-assign admin role from client

### Check User's Metadata

```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as user_meta_role,
  raw_app_meta_data->>'role' as app_meta_role
FROM auth.users 
WHERE email = 'your-admin@email.com';
```

Expected result:
- `user_meta_role`: `null` (or empty)
- `app_meta_role`: `admin` ✅

---

## 🛡️ Security Improvements

### Before (VULNERABLE):
```typescript
// ❌ user_metadata is editable by users via client SDK
const role = user.user_metadata?.role

// ❌ RLS check vulnerable to manipulation
(auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
```

### After (SECURE):
```typescript
// ✅ app_metadata is READ-ONLY for users, server-only edits
const role = user.app_metadata?.role

// ✅ RLS check secure against privilege escalation
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

---

## 📋 Files Changed

1. **`ENABLE_RLS_ALL_TABLES.sql`**
   - `is_admin()` function now checks `app_metadata`
   - Updated admin setup instructions

2. **`supabase/migrations/20260118000003_create_admin_settings_table.sql`**
   - All RLS policies check `app_metadata`
   - Default insert queries `raw_app_meta_data`

3. **`frontend/src/lib/supabase/middleware.ts`**
   - Middleware checks `user.app_metadata?.role`

4. **`frontend/src/app/admin/page.tsx`**
   - Admin page reads `user.app_metadata?.role`

5. **`frontend/src/components/admin/admin-login-form.tsx`**
   - Login form stores `user.app_metadata?.role`

---

## 🚀 Deployment Steps

1. ✅ Apply SQL migration (update RLS policies)
2. ✅ Deploy frontend changes (TypeScript code)
3. ⚠️ **CRITICAL**: Migrate existing admin users to `app_metadata`
4. ✅ Test admin login and access
5. ✅ Verify non-admin users are blocked

---

## 📚 References

- [Supabase Auth: User Metadata vs App Metadata](https://supabase.com/docs/guides/auth/managing-user-data#user-metadata-vs-app-metadata)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Common Supabase Security Mistakes](https://supabase.com/docs/guides/auth/row-level-security#common-mistakes)
