-- =============================================
-- Coffee Journal Fresh - v0.4.0 Migration Script
-- Personal Taste Discovery Features
-- 
-- This script checks for existing tables and adds
-- new tables/columns for MVP v0.4.0
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. User Taste Profiles (New Table)
-- =============================================
CREATE TABLE IF NOT EXISTS user_taste_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Flavor preferences vector (based on 86-flavor wheel)
  flavor_preferences JSONB DEFAULT '{}',
  
  -- Basic taste preferences (0-10 scale)
  sweetness_preference DECIMAL(3,1) DEFAULT 5.0 CHECK (sweetness_preference >= 0 AND sweetness_preference <= 10),
  acidity_preference DECIMAL(3,1) DEFAULT 5.0 CHECK (acidity_preference >= 0 AND acidity_preference <= 10),
  bitterness_preference DECIMAL(3,1) DEFAULT 5.0 CHECK (bitterness_preference >= 0 AND bitterness_preference <= 10),
  body_preference DECIMAL(3,1) DEFAULT 5.0 CHECK (body_preference >= 0 AND body_preference <= 10),
  balance_preference DECIMAL(3,1) DEFAULT 5.0 CHECK (balance_preference >= 0 AND balance_preference <= 10),
  
  -- Personal statistics
  total_tastings INTEGER DEFAULT 0,
  unique_flavors_tried INTEGER DEFAULT 0,
  vocabulary_level INTEGER DEFAULT 1 CHECK (vocabulary_level >= 1 AND vocabulary_level <= 10),
  taste_discovery_rate DECIMAL(5,2) DEFAULT 0.0 CHECK (taste_discovery_rate >= 0 AND taste_discovery_rate <= 100),
  
  -- Metadata
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Flavor Learning Progress (New Table)
-- =============================================
CREATE TABLE IF NOT EXISTS flavor_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  
  -- Flavor information
  flavor_category VARCHAR(50) NOT NULL,
  flavor_subcategory VARCHAR(50),
  specific_flavor VARCHAR(50),
  
  -- Learning statistics
  exposure_count INTEGER DEFAULT 0,
  identification_count INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (accuracy_rate >= 0 AND accuracy_rate <= 1),
  confidence_level INTEGER DEFAULT 1 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  
  -- Learning timestamps
  first_encountered_at TIMESTAMPTZ,
  last_practiced_at TIMESTAMPTZ,
  mastery_achieved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per user and flavor combination
  UNIQUE(user_id, flavor_category, flavor_subcategory, specific_flavor)
);

-- =============================================
-- 3. User Achievements (New Table)
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  
  achievement_type VARCHAR(50) NOT NULL,
  achievement_level INTEGER DEFAULT 1 CHECK (achievement_level >= 1 AND achievement_level <= 5),
  achievement_data JSONB DEFAULT '{}',
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL(3,2) DEFAULT 1.0 CHECK (progress >= 0 AND progress <= 1),
  
  -- Unique constraint per user and achievement type
  UNIQUE(user_id, achievement_type)
);

-- =============================================
-- 4. Daily Taste Statistics (New Table)
-- =============================================
CREATE TABLE IF NOT EXISTS daily_taste_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  
  stat_date DATE NOT NULL,
  tastings_count INTEGER DEFAULT 0,
  new_flavors_discovered INTEGER DEFAULT 0,
  vocabulary_words_used INTEGER DEFAULT 0,
  taste_accuracy_score DECIMAL(5,2) DEFAULT 0.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per user and date
  UNIQUE(user_id, stat_date)
);

-- =============================================
-- 5. Achievement Definitions (New Table)
-- =============================================
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  achievement_type VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category VARCHAR(30) CHECK (category IN ('first_steps', 'consistency', 'flavor_explorer', 'taste_accuracy', 'vocabulary', 'level_up', 'mastery', 'personal_best', 'seasonal', 'hidden', 'collector')),
  
  requirements JSONB NOT NULL,
  rewards JSONB NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. Alter Existing Tables (with safety checks)
-- =============================================

-- Add columns to tasting_records if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasting_records' 
                AND column_name = 'personal_insights') THEN
    ALTER TABLE tasting_records ADD COLUMN personal_insights JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasting_records' 
                AND column_name = 'vocabulary_used') THEN
    ALTER TABLE tasting_records ADD COLUMN vocabulary_used TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasting_records' 
                AND column_name = 'difficulty_level') THEN
    ALTER TABLE tasting_records ADD COLUMN difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasting_records' 
                AND column_name = 'learning_points') THEN
    ALTER TABLE tasting_records ADD COLUMN learning_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasting_records' 
                AND column_name = 'taste_confidence') THEN
    ALTER TABLE tasting_records ADD COLUMN taste_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (taste_confidence >= 0 AND taste_confidence <= 1);
  END IF;
END $$;

-- =============================================
-- 7. Create Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_taste_profiles_user_id ON user_taste_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON flavor_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_category ON flavor_learning_progress(flavor_category);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_taste_stats(user_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_tasting_learning_points ON tasting_records(learning_points DESC);

-- =============================================
-- 8. Create Views for Analytics
-- =============================================

-- User progress overview
CREATE OR REPLACE VIEW user_progress_overview AS
SELECT 
  utp.user_id,
  utp.vocabulary_level,
  utp.taste_discovery_rate,
  utp.total_tastings,
  utp.unique_flavors_tried,
  COUNT(DISTINCT ua.achievement_type) as achievements_unlocked,
  MAX(dts.stat_date) as last_active_date
FROM user_taste_profiles utp
LEFT JOIN user_achievements ua ON utp.user_id = ua.user_id
LEFT JOIN daily_taste_stats dts ON utp.user_id = dts.user_id
GROUP BY utp.user_id, utp.vocabulary_level, utp.taste_discovery_rate, utp.total_tastings, utp.unique_flavors_tried;

-- Flavor mastery summary
CREATE OR REPLACE VIEW flavor_mastery_summary AS
SELECT 
  user_id,
  flavor_category,
  COUNT(DISTINCT specific_flavor) as flavors_learned,
  AVG(accuracy_rate) as avg_accuracy,
  MAX(confidence_level) as max_confidence,
  COUNT(CASE WHEN mastery_achieved_at IS NOT NULL THEN 1 END) as mastered_count
FROM flavor_learning_progress
GROUP BY user_id, flavor_category;

-- =============================================
-- 9. Insert Initial Achievement Definitions
-- =============================================
INSERT INTO achievement_definitions (achievement_type, title, description, icon, rarity, category, requirements, rewards) VALUES
-- First Steps
('first_tasting', '첫 한 모금', '첫 번째 커피 테이스팅을 완료하세요', '☕', 'common', 'first_steps', '{"type": "tasting_count", "value": 1}', '{"type": "points", "value": 100}'),
('first_week', '첫 주간 완주', '일주일 동안 매일 테이스팅하세요', '📅', 'common', 'first_steps', '{"type": "consecutive_days", "value": 7}', '{"type": "points", "value": 500}'),

-- Flavor Explorer
('flavor_explorer_bronze', '향미 탐험가 브론즈', '10가지 서로 다른 향미를 발견하세요', '🗺️', 'common', 'flavor_explorer', '{"type": "unique_flavors", "value": 10}', '{"type": "badge", "value": "flavor_explorer_bronze"}'),
('flavor_explorer_silver', '향미 탐험가 실버', '25가지 서로 다른 향미를 발견하세요', '🗺️', 'rare', 'flavor_explorer', '{"type": "unique_flavors", "value": 25}', '{"type": "badge", "value": "flavor_explorer_silver"}'),
('flavor_explorer_gold', '향미 탐험가 골드', '50가지 서로 다른 향미를 발견하세요', '🗺️', 'epic', 'flavor_explorer', '{"type": "unique_flavors", "value": 50}', '{"type": "badge", "value": "flavor_explorer_gold"}'),

-- Taste Accuracy
('taste_novice', '미각 초보자', '향미 퀴즈에서 70% 이상 정확도 달성', '🎯', 'common', 'taste_accuracy', '{"type": "quiz_accuracy", "value": 0.7}', '{"type": "title", "value": "Taste Novice"}'),
('taste_expert', '미각 전문가', '향미 퀴즈에서 85% 이상 정확도 달성', '🎯', 'rare', 'taste_accuracy', '{"type": "quiz_accuracy", "value": 0.85}', '{"type": "title", "value": "Taste Expert"}'),
('taste_master', '미각 마스터', '향미 퀴즈에서 95% 이상 정확도 달성', '🎯', 'epic', 'taste_accuracy', '{"type": "quiz_accuracy", "value": 0.95}', '{"type": "title", "value": "Taste Master"}'),

-- Consistency
('week_warrior', '주간 전사', '한 달 동안 매주 5회 이상 테이스팅', '💪', 'common', 'consistency', '{"type": "weekly_tastings", "value": 5, "weeks": 4}', '{"type": "points", "value": 1000}'),
('month_master', '월간 마스터', '30일 연속 테이스팅', '🏆', 'rare', 'consistency', '{"type": "consecutive_days", "value": 30}', '{"type": "points", "value": 2000}'),

-- Vocabulary
('word_collector', '단어 수집가', '50개의 다른 향미 단어 사용', '📚', 'common', 'vocabulary', '{"type": "unique_words", "value": 50}', '{"type": "points", "value": 750}'),
('vocabulary_virtuoso', '어휘 거장', '100개의 다른 향미 단어 사용', '📚', 'epic', 'vocabulary', '{"type": "unique_words", "value": 100}', '{"type": "title", "value": "Vocabulary Virtuoso"}'),

-- Hidden Achievements
('early_bird', '얼리버드', '오전 7시 이전에 커피 테이스팅', '🌅', 'rare', 'hidden', '{"type": "tasting_time", "value": "07:00"}', '{"type": "points", "value": 500}'),
('night_owl', '올빼미', '오후 10시 이후에 커피 테이스팅', '🦉', 'rare', 'hidden', '{"type": "tasting_time", "value": "22:00"}', '{"type": "points", "value": 500}'),
('perfect_match', '완벽한 매치', '로스터 노트와 100% 일치', '💯', 'legendary', 'hidden', '{"type": "match_score", "value": 100}', '{"type": "title", "value": "Perfect Matcher"}')
ON CONFLICT (achievement_type) DO NOTHING;

-- =============================================
-- 10. Create Trigger for Updated Timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_taste_profiles_updated_at') THEN
    CREATE TRIGGER update_user_taste_profiles_updated_at 
    BEFORE UPDATE ON user_taste_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================
-- 11. Grant Permissions (adjust as needed)
-- =============================================
-- These should match your RLS policies
GRANT ALL ON user_taste_profiles TO authenticated;
GRANT ALL ON flavor_learning_progress TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON daily_taste_stats TO authenticated;
GRANT SELECT ON achievement_definitions TO authenticated;
GRANT SELECT ON user_progress_overview TO authenticated;
GRANT SELECT ON flavor_mastery_summary TO authenticated;

-- =============================================
-- Migration Complete!
-- =============================================
-- Run this to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%taste%' OR table_name LIKE '%achievement%' OR table_name LIKE '%flavor%' ORDER BY table_name;