-- Coffee Journal Admin - Admin User Setup
-- Run this script to set up admin users after they have signed up

-- 1. Set admin metadata for specific users
-- Replace email addresses with your actual admin emails

-- Method 1: Set admin metadata for existing users
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true, "admin_level": "super"}'::jsonb
WHERE email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com'
  -- Add more admin emails here
);

-- Method 2: Verify admin users are set correctly
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin,
  raw_user_meta_data->>'admin_level' as admin_level,
  created_at
FROM auth.users
WHERE email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com'
);

-- 3. Create admin users in your public users table (if they don't exist)
INSERT INTO users (
  id,
  email,
  display_name,
  is_verified,
  is_moderator,
  level,
  created_at
)
SELECT 
  auth_users.id,
  auth_users.email,
  COALESCE(auth_users.raw_user_meta_data->>'full_name', split_part(auth_users.email, '@', 1)) as display_name,
  true as is_verified,
  true as is_moderator,
  10 as level, -- Max level for admin
  auth_users.created_at
FROM auth.users auth_users
WHERE auth_users.email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com'
)
AND NOT EXISTS (
  SELECT 1 FROM users WHERE users.id = auth_users.id
);

-- 4. Update existing admin users in public table
UPDATE users 
SET 
  is_verified = true,
  is_moderator = true,
  level = GREATEST(level, 10) -- Ensure admin level
WHERE email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com'
);

-- 5. Verify admin setup
SELECT 
  u.id,
  u.email,
  u.display_name,
  u.is_verified,
  u.is_moderator,
  u.level,
  au.raw_user_meta_data->>'is_admin' as auth_is_admin
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com'
);

-- 6. Test admin access function
SELECT 
  email,
  check_admin_access(email) as has_admin_access
FROM auth.users
WHERE email IN (
  'hello@zimojin.com',
  'admin@coffeejournalFresh.com',
  'test@example.com' -- This should return false
);

-- Admin user setup complete!
-- The users listed above should now have full admin access to the dashboard.