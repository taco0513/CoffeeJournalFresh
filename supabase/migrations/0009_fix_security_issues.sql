-- Migration: Fix Security Issues
-- Description: Enable RLS on all public tables and remove SECURITY DEFINER from views
-- Date: 2025-01-26

-- =====================================================
-- PART 1: Enable Row Level Security (RLS) on all tables
-- =====================================================

-- Enable RLS on all public tables
ALTER TABLE public.coffee_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flavor_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_taste_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: Create RLS Policies for each table
-- =====================================================

-- Coffee Catalog Policies (public read, admin write)
CREATE POLICY "Coffee catalog is viewable by everyone" ON public.coffee_catalog
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert coffee catalog" ON public.coffee_catalog
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update coffee catalog" ON public.coffee_catalog
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete coffee catalog" ON public.coffee_catalog
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Collected Tastings Policies (users own data)
CREATE POLICY "Users can view own collected tastings" ON public.collected_tastings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own collected tastings" ON public.collected_tastings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own collected tastings" ON public.collected_tastings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own collected tastings" ON public.collected_tastings
  FOR DELETE USING (user_id = auth.uid());

-- Collection Logs Policies (users own data)
CREATE POLICY "Users can view own collection logs" ON public.collection_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own collection logs" ON public.collection_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- User Taste Profiles Policies
CREATE POLICY "Users can view own taste profile" ON public.user_taste_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own taste profile" ON public.user_taste_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Flavor Learning Progress Policies
CREATE POLICY "Users can view own learning progress" ON public.flavor_learning_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning progress" ON public.flavor_learning_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own learning progress" ON public.flavor_learning_progress
  FOR UPDATE USING (user_id = auth.uid());

-- User Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (user_id = auth.uid());

-- Daily Taste Stats Policies
CREATE POLICY "Users can view own daily stats" ON public.daily_taste_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own daily stats" ON public.daily_taste_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own daily stats" ON public.daily_taste_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Achievement Definitions Policies (public read, admin write)
CREATE POLICY "Achievement definitions are viewable by everyone" ON public.achievement_definitions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage achievement definitions" ON public.achievement_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- PART 3: Remove SECURITY DEFINER from Views
-- =====================================================

-- Drop and recreate views without SECURITY DEFINER
-- Note: We need to drop dependent views first due to dependencies

-- 1. Drop all views
DROP VIEW IF EXISTS public.admin_notification_stats CASCADE;
DROP VIEW IF EXISTS public.roastery_stats CASCADE;
DROP VIEW IF EXISTS public.origin_stats CASCADE;
DROP VIEW IF EXISTS public.trending_coffees CASCADE;
DROP VIEW IF EXISTS public.collection_stats CASCADE;
DROP VIEW IF EXISTS public.user_progress_overview CASCADE;
DROP VIEW IF EXISTS public.user_statistics CASCADE;
DROP VIEW IF EXISTS public.flavor_analysis CASCADE;
DROP VIEW IF EXISTS public.flavor_mastery_summary CASCADE;

-- 2. Recreate views without SECURITY DEFINER

-- Flavor Mastery Summary View
CREATE VIEW public.flavor_mastery_summary AS
SELECT 
    u.id AS user_id,
    COALESCE(u.raw_user_meta_data->>'display_name', u.email) AS display_name,
    COUNT(DISTINCT t.id) AS total_tastings,
    COUNT(DISTINCT t.coffee_name) AS unique_coffees,
    COUNT(DISTINCT DATE(t.created_at)) AS tasting_days,
    ARRAY_AGG(DISTINCT f.level) AS mastered_levels
FROM auth.users u
LEFT JOIN public.tasting_records t ON u.id = t.user_id
LEFT JOIN public.flavor_notes f ON t.id = f.tasting_id
GROUP BY u.id, u.email, u.raw_user_meta_data;

-- Flavor Analysis View
CREATE VIEW public.flavor_analysis AS
SELECT 
    t.user_id,
    f.level,
    f.value AS flavor,
    COUNT(*) AS selection_count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY t.user_id, f.level), 0), 2) AS percentage
FROM public.tasting_records t
JOIN public.flavor_notes f ON t.id = f.tasting_id
GROUP BY t.user_id, f.level, f.value;

-- User Statistics View
CREATE VIEW public.user_statistics AS
SELECT 
    u.id AS user_id,
    COUNT(DISTINCT t.id) AS total_tastings,
    COUNT(DISTINCT t.coffee_name) AS unique_coffees,
    COUNT(DISTINCT t.cafe_name) AS unique_cafes,
    AVG(t.match_score_total) AS avg_rating,
    MAX(t.created_at) AS last_tasting_date,
    COUNT(DISTINCT DATE(t.tasted_at)) AS active_days
FROM auth.users u
LEFT JOIN public.tasting_records t ON u.id = t.user_id
GROUP BY u.id;

-- User Progress Overview View
CREATE VIEW public.user_progress_overview AS
SELECT 
    u.id AS user_id,
    COALESCE(u.raw_user_meta_data->>'display_name', u.email) AS display_name,
    us.total_tastings,
    us.unique_coffees,
    us.avg_rating,
    ua.total_points AS achievement_points,
    COUNT(DISTINCT ua.achievement_id) AS achievements_earned
FROM auth.users u
LEFT JOIN public.user_statistics us ON u.id = us.user_id
LEFT JOIN public.user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.email, u.raw_user_meta_data, us.total_tastings, us.unique_coffees, us.avg_rating, ua.total_points;

-- Collection Stats View
CREATE VIEW public.collection_stats AS
SELECT 
    ct.user_id,
    ct.coffee_id,
    c.name AS coffee_name,
    c.roastery,
    COUNT(*) AS collection_count,
    MAX(ct.created_at) AS last_collected
FROM public.collected_tastings ct
JOIN public.coffee_catalog c ON ct.coffee_id = c.id
GROUP BY ct.user_id, ct.coffee_id, c.name, c.roastery;

-- Trending Coffees View
CREATE VIEW public.trending_coffees AS
SELECT 
    c.id AS coffee_id,
    c.name,
    c.roastery,
    c.origin,
    COUNT(DISTINCT t.user_id) AS unique_users,
    COUNT(t.id) AS total_tastings,
    AVG(t.match_score_total) AS avg_rating,
    MAX(t.created_at) AS last_tasted
FROM public.coffee_catalog c
JOIN public.tasting_records t ON c.name = t.coffee_name
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name, c.roastery, c.origin
ORDER BY total_tastings DESC, avg_rating DESC;

-- Origin Stats View
CREATE VIEW public.origin_stats AS
SELECT 
    c.origin,
    COUNT(DISTINCT c.id) AS coffee_count,
    COUNT(DISTINCT t.id) AS tasting_count,
    AVG(t.match_score_total) AS avg_rating,
    COUNT(DISTINCT t.user_id) AS unique_users
FROM public.coffee_catalog c
LEFT JOIN public.tasting_records t ON c.name = t.coffee_name
GROUP BY c.origin;

-- Roastery Stats View
CREATE VIEW public.roastery_stats AS
SELECT 
    c.roastery,
    COUNT(DISTINCT c.id) AS coffee_count,
    COUNT(DISTINCT t.id) AS tasting_count,
    AVG(t.match_score_total) AS avg_rating,
    COUNT(DISTINCT t.user_id) AS unique_users
FROM public.coffee_catalog c
LEFT JOIN public.tasting_records t ON c.name = t.coffee_name
GROUP BY c.roastery;

-- Admin Notification Stats View
CREATE VIEW public.admin_notification_stats AS
SELECT 
    n.type,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN n.read = false THEN 1 END) AS unread_count,
    MAX(n.created_at) AS last_notification
FROM public.notifications n
GROUP BY n.type;

-- =====================================================
-- PART 4: Grant appropriate permissions to views
-- =====================================================

-- Grant SELECT permission on all views to authenticated users
GRANT SELECT ON public.flavor_mastery_summary TO authenticated;
GRANT SELECT ON public.flavor_analysis TO authenticated;
GRANT SELECT ON public.user_statistics TO authenticated;
GRANT SELECT ON public.user_progress_overview TO authenticated;
GRANT SELECT ON public.collection_stats TO authenticated;
GRANT SELECT ON public.trending_coffees TO authenticated;
GRANT SELECT ON public.origin_stats TO authenticated;
GRANT SELECT ON public.roastery_stats TO authenticated;

-- Admin notification stats should only be accessible to admins
GRANT SELECT ON public.admin_notification_stats TO authenticated;

-- Add RLS policy for admin_notification_stats using a function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a secure view wrapper for admin stats
CREATE OR REPLACE VIEW public.admin_notification_stats_secure AS
SELECT * FROM public.admin_notification_stats
WHERE public.is_admin();

GRANT SELECT ON public.admin_notification_stats_secure TO authenticated;

-- =====================================================
-- PART 5: Verify security setup
-- =====================================================

-- Add comments explaining the security model
COMMENT ON TABLE public.coffee_catalog IS 'Public read, admin write. Contains coffee catalog data.';
COMMENT ON TABLE public.collected_tastings IS 'User-specific data. Users can only access their own records.';
COMMENT ON TABLE public.collection_logs IS 'User-specific logs. Users can only access their own records.';
COMMENT ON TABLE public.user_taste_profiles IS 'User-specific taste profiles. Users can only access their own data.';
COMMENT ON TABLE public.flavor_learning_progress IS 'User-specific learning progress. Users can only access their own data.';
COMMENT ON TABLE public.user_achievements IS 'User-specific achievements. Users can only access their own data.';
COMMENT ON TABLE public.daily_taste_stats IS 'User-specific daily statistics. Users can only access their own data.';
COMMENT ON TABLE public.achievement_definitions IS 'Public read, admin write. Contains achievement definitions.';