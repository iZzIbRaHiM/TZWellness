-- Check current phone number format in admin_settings
SELECT 
  clinic_name,
  clinic_phone,
  LENGTH(clinic_phone) as phone_length,
  REGEXP_REPLACE(clinic_phone, '[^0-9]', '', 'g') as digits_only,
  LENGTH(REGEXP_REPLACE(clinic_phone, '[^0-9]', '', 'g')) as digit_count,
  updated_at
FROM admin_settings
ORDER BY updated_at DESC
LIMIT 1;

-- This will show:
-- 1. Current phone format as stored
-- 2. How many characters total
-- 3. Digits only (after removing formatting)
-- 4. How many digits
-- 5. When it was last updated
