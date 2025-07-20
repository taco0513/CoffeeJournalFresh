-- =============================================
-- Supabase Monitoring Queries
-- Useful queries to keep in SQL Editor
-- =============================================

-- 1. Quick Health Check
-- Shows table counts and recent activity
SELECT 'HEALTH CHECK' as query_name;
SELECT 
  'Total Users' as metric, COUNT(*) as value FROM auth.users
UNION ALL
SELECT 'Active Profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'Total Coffees', COUNT(*) FROM coffee_catalog
UNION ALL
SELECT 'Pending Coffees', COUNT(*) FROM coffee_catalog WHERE status = 'pending'
UNION ALL
SELECT 'Total Tastings', COUNT(*) FROM tasting_records
UNION ALL
SELECT 'Today Tastings', COUNT(*) FROM tasting_records WHERE created_at >= CURRENT_DATE;

-- 2. User Activity Summary
-- Shows user engagement metrics
SELECT 'USER ACTIVITY' as query_name;
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_tastings
FROM tasting_records
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 3. Coffee Catalog Status
-- Shows coffee verification status
SELECT 'COFFEE CATALOG STATUS' as query_name;
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM coffee_catalog
GROUP BY status
ORDER BY count DESC;

-- 4. Achievement Progress
-- Shows how many users have each achievement
SELECT 'ACHIEVEMENT PROGRESS' as query_name;
SELECT 
  ad.name,
  ad.category,
  COUNT(ua.user_id) as users_earned,
  ad.max_level
FROM achievement_definitions ad
LEFT JOIN user_achievements ua ON ad.id = ua.achievement_id
GROUP BY ad.id, ad.name, ad.category, ad.max_level
ORDER BY ad.category, ad.name;

-- 5. Database Size Check
-- Shows table sizes
SELECT 'DATABASE SIZE' as query_name;
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;