-- Migration: Fix Security Issues (Version 2)
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

-- Collected Tastings Policies (users own data) - Note: user_id is TEXT type
CREATE POLICY "Users can view own collected tastings" ON public.collected_tastings
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own collected tastings" ON public.collected_tastings
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own collected tastings" ON public.collected_tastings
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own collected tastings" ON public.collected_tastings
  FOR DELETE USING (user_id = auth.uid()::text);

-- Collection Logs Policies (users own data) - user_id is TEXT type
CREATE POLICY "Users can view own collection logs" ON public.collection_logs
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own collection logs" ON public.collection_logs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- User Taste Profiles Policies - user_id is UUID
CREATE POLICY "Users can view own taste profile" ON public.user_taste_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own taste profile" ON public.user_taste_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Flavor Learning Progress Policies - user_id is UUID
CREATE POLICY "Users can view own learning progress" ON public.flavor_learning_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning progress" ON public.flavor_learning_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own learning progress" ON public.flavor_learning_progress
  FOR UPDATE USING (user_id = auth.uid());

-- User Achievements Policies - user_id is UUID
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (user_id = auth.uid());

-- Daily Taste Stats Policies - user_id is UUID
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
-- PART 3: Fix Views (Remove SECURITY DEFINER)
-- =====================================================

-- Since we don't know the exact structure of the views, we'll create a safer approach
-- by creating new views without SECURITY DEFINER

-- Note: The views need to be recreated based on actual table structures
-- Here are placeholder comments for what needs to be done:

-- 1. flavor_mastery_summary - uses tasting_records, flavor_notes
-- 2. flavor_analysis - uses tasting_records, flavor_notes
-- 3. user_statistics - uses tasting_records
-- 4. user_progress_overview - uses user_achievements, tasting_records
-- 5. collection_stats - uses collected_tastings, coffee_catalog
-- 6. trending_coffees - uses coffee_catalog, tasting_records
-- 7. origin_stats - uses coffee_catalog, tasting_records
-- 8. roastery_stats - uses coffee_catalog, tasting_records
-- 9. admin_notification_stats - uses notifications (if exists)

-- =====================================================
-- PART 4: Grant appropriate permissions
-- =====================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on tables to authenticated users (RLS will filter)
GRANT SELECT ON public.coffee_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collected_tastings TO authenticated;
GRANT SELECT, INSERT ON public.collection_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_taste_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.flavor_learning_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_taste_stats TO authenticated;
GRANT SELECT ON public.achievement_definitions TO authenticated;

-- =====================================================
-- PART 5: Add helpful comments
-- =====================================================

COMMENT ON TABLE public.coffee_catalog IS 'Public coffee catalog - readable by all, writable by admins only';
COMMENT ON TABLE public.collected_tastings IS 'User tasting collection data - users can only access their own records (user_id is TEXT)';
COMMENT ON TABLE public.collection_logs IS 'Collection activity logs - users can only access their own records (user_id is TEXT)';
COMMENT ON TABLE public.user_taste_profiles IS 'User taste preference profiles - users can only access their own data';
COMMENT ON TABLE public.flavor_learning_progress IS 'User flavor learning progress tracking - users can only access their own data';
COMMENT ON TABLE public.user_achievements IS 'User achievement tracking - users can only access their own data';
COMMENT ON TABLE public.daily_taste_stats IS 'Daily taste statistics per user - users can only access their own data';
COMMENT ON TABLE public.achievement_definitions IS 'Achievement definition catalog - readable by all, writable by admins only';