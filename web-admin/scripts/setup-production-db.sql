-- Coffee Journal Admin - Production Database Setup
-- Run this script in your Supabase SQL Editor for production setup

-- 1. Create admin access function
CREATE OR REPLACE FUNCTION check_admin_access(user_email text)
RETURNS boolean AS $$
BEGIN
  -- Add your admin email addresses here
  RETURN user_email IN (
    'hello@zimojin.com',
    'admin@coffeejournalFresh.com'
    -- Add more admin emails as needed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create is_admin RPC function (for API access)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN check_admin_access(auth.jwt() ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable Row Level Security on all tables
ALTER TABLE IF EXISTS coffee_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create admin policies for coffee_catalog
DROP POLICY IF EXISTS "Admin full access coffee_catalog" ON coffee_catalog;
CREATE POLICY "Admin full access coffee_catalog" ON coffee_catalog
  FOR ALL USING (check_admin_access(auth.jwt() ->> 'email'));

-- 5. Create admin policies for users
DROP POLICY IF EXISTS "Admin full access users" ON users;
CREATE POLICY "Admin full access users" ON users
  FOR ALL USING (check_admin_access(auth.jwt() ->> 'email'));

-- 6. Create admin policies for tastings
DROP POLICY IF EXISTS "Admin read access tastings" ON tastings;
CREATE POLICY "Admin read access tastings" ON tastings
  FOR SELECT USING (check_admin_access(auth.jwt() ->> 'email'));

-- 7. Create admin policies for admin_notifications
DROP POLICY IF EXISTS "Admin full access notifications" ON admin_notifications;
CREATE POLICY "Admin full access notifications" ON admin_notifications
  FOR ALL USING (check_admin_access(auth.jwt() ->> 'email'));

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coffee_catalog_created_at ON coffee_catalog(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coffee_catalog_verified ON coffee_catalog(verified_by_moderator);
CREATE INDEX IF NOT EXISTS idx_coffee_catalog_roastery ON coffee_catalog(roastery);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 9. Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE is_verified = true) as verified_users,
  (SELECT COUNT(*) FROM users WHERE is_moderator = true) as moderator_users,
  (SELECT COUNT(*) FROM coffee_catalog) as total_coffees,
  (SELECT COUNT(*) FROM coffee_catalog WHERE verified_by_moderator = true) as verified_coffees,
  (SELECT COUNT(*) FROM coffee_catalog WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_coffees,
  (SELECT COUNT(*) FROM tastings) as total_tastings,
  (SELECT COUNT(*) FROM tastings WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_tastings,
  (SELECT AVG(level) FROM users WHERE level IS NOT NULL) as avg_user_level;

-- 10. Grant access to admin view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- 11. Create RLS policy for admin stats view
CREATE POLICY "Admin stats access" ON admin_dashboard_stats
  FOR SELECT USING (check_admin_access(auth.jwt() ->> 'email'));

-- 12. Create function to get popular roasters
CREATE OR REPLACE FUNCTION get_popular_roasters(limit_count int DEFAULT 10)
RETURNS TABLE(roastery text, coffee_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.roastery,
    COUNT(*) as coffee_count
  FROM coffee_catalog c
  WHERE c.roastery IS NOT NULL
  GROUP BY c.roastery
  ORDER BY coffee_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to get user growth data
CREATE OR REPLACE FUNCTION get_user_growth_data()
RETURNS TABLE(date date, user_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as user_count
  FROM users
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to get coffee verification stats
CREATE OR REPLACE FUNCTION get_coffee_verification_stats()
RETURNS TABLE(status text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN verified_by_moderator = true THEN 'verified'
      ELSE 'pending'
    END as status,
    COUNT(*) as count
  FROM coffee_catalog
  GROUP BY verified_by_moderator;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to get weekly activity data
CREATE OR REPLACE FUNCTION get_weekly_activity_data()
RETURNS TABLE(day_name text, coffee_additions bigint, new_users bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(date_series, 'Day') as day_name,
    COALESCE(coffee_data.count, 0) as coffee_additions,
    COALESCE(user_data.count, 0) as new_users
  FROM (
    SELECT generate_series(
      DATE_TRUNC('week', NOW()),
      DATE_TRUNC('week', NOW()) + INTERVAL '6 days',
      '1 day'::interval
    )::date as date_series
  ) dates
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM coffee_catalog
    WHERE created_at >= DATE_TRUNC('week', NOW())
    GROUP BY DATE(created_at)
  ) coffee_data ON dates.date_series = coffee_data.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= DATE_TRUNC('week', NOW())
    GROUP BY DATE(created_at)
  ) user_data ON dates.date_series = user_data.date
  ORDER BY dates.date_series;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Grant execute permissions to admin functions
GRANT EXECUTE ON FUNCTION get_popular_roasters TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_coffee_verification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_activity_data TO authenticated;

-- Production setup complete!
-- Next steps:
-- 1. Set admin metadata for your admin users
-- 2. Test the admin dashboard access
-- 3. Verify all functions work correctly