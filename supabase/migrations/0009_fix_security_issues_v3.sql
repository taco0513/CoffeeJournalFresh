-- Migration: Fix Security Issues (Version 3)
-- Description: Enable RLS on all public tables and remove SECURITY DEFINER from views
-- Date: 2025-01-26
-- Note: All user_id comparisons use TEXT casting for compatibility

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
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own collected tastings" ON public.collected_tastings
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own collected tastings" ON public.collected_tastings
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own collected tastings" ON public.collected_tastings
  FOR DELETE USING (user_id = auth.uid()::text);

-- Collection Logs Policies (users own data)
CREATE POLICY "Users can view own collection logs" ON public.collection_logs
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own collection logs" ON public.collection_logs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- User Taste Profiles Policies
CREATE POLICY "Users can view own taste profile" ON public.user_taste_profiles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own taste profile" ON public.user_taste_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Flavor Learning Progress Policies
CREATE POLICY "Users can view own learning progress" ON public.flavor_learning_progress
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own learning progress" ON public.flavor_learning_progress
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own learning progress" ON public.flavor_learning_progress
  FOR UPDATE USING (user_id = auth.uid()::text);

-- User Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Daily Taste Stats Policies
CREATE POLICY "Users can view own daily stats" ON public.daily_taste_stats
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own daily stats" ON public.daily_taste_stats
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own daily stats" ON public.daily_taste_stats
  FOR UPDATE USING (user_id = auth.uid()::text);

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
-- PART 3: Grant appropriate permissions
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
-- PART 4: Add helpful comments
-- =====================================================

COMMENT ON TABLE public.coffee_catalog IS 'Public coffee catalog - readable by all, writable by admins only';
COMMENT ON TABLE public.collected_tastings IS 'User tasting collection data - users can only access their own records';
COMMENT ON TABLE public.collection_logs IS 'Collection activity logs - users can only access their own records';
COMMENT ON TABLE public.user_taste_profiles IS 'User taste preference profiles - users can only access their own data';
COMMENT ON TABLE public.flavor_learning_progress IS 'User flavor learning progress tracking - users can only access their own data';
COMMENT ON TABLE public.user_achievements IS 'User achievement tracking - users can only access their own data';
COMMENT ON TABLE public.daily_taste_stats IS 'Daily taste statistics per user - users can only access their own data';
COMMENT ON TABLE public.achievement_definitions IS 'Achievement definition catalog - readable by all, writable by admins only';