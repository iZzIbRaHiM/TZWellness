-- ============================================
-- BETTER SOLUTION: Create a public view for clinic info only
-- This exposes ONLY clinic contact info, not personal admin data
-- ============================================

-- Create a public view that only shows clinic contact information
CREATE OR REPLACE VIEW public.clinic_public_info AS
SELECT 
  clinic_name,
  clinic_email,
  clinic_phone,
  clinic_address,
  business_hours
FROM public.admin_settings
ORDER BY updated_at DESC
LIMIT 1;

-- Grant SELECT to anonymous users on the view
GRANT SELECT ON public.clinic_public_info TO anon;
GRANT SELECT ON public.clinic_public_info TO authenticated;

-- Add comment
COMMENT ON VIEW public.clinic_public_info IS
'Public view exposing only clinic contact information for website display.
Does not include personal admin data (full_name, email, phone, bio, etc).
Automatically shows the most recently updated clinic settings.';
