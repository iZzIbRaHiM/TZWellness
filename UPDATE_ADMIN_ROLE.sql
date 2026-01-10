-- See ALL users in the database (not just your email)
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- If you see the user with ID 9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7, run this:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = '9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7';

-- Otherwise, update the existing admin user and use that account:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tzwellnesshealth@gmail.com';

-- Verify the updates
SELECT 
  id,
  email,
  raw_user_meta_data,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
