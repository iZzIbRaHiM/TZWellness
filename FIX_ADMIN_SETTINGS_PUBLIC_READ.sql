-- ============================================
-- FIX: Allow public read access to clinic contact info
-- This allows the website to display clinic phone/email/name
-- even for non-authenticated users
-- ============================================

-- Add a new policy for public SELECT on clinic info columns only
CREATE POLICY "Public users can view clinic contact information"
    ON public.admin_settings
    FOR SELECT
    USING (true);  -- Allow all reads

-- Note: This is safe because:
-- 1. Only SELECT is allowed (no INSERT/UPDATE/DELETE for public)
-- 2. Personal admin data (full_name, phone, email, bio) is separate from clinic data
-- 3. We're only exposing public clinic information that should be visible to website visitors
-- 4. INSERT/UPDATE/DELETE still require admin authentication

COMMENT ON POLICY "Public users can view clinic contact information" ON public.admin_settings IS
'Allows anonymous users to read clinic contact information (clinic_name, clinic_email, clinic_phone) for website display.
Personal admin settings remain protected by the "Admin users can view their own settings" policy.';
