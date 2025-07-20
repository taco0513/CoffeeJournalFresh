-- =============================================
-- v0.4.0 Migration Verification Script (Simple)
-- =============================================

-- 1. List all personal taste related tables
SELECT '=== CHECKING NEW TABLES ===' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_taste_profiles',
    'flavor_learning_progress', 
    'user_achievements',
    'daily_taste_stats',
    'achievement_definitions'
)
ORDER BY table_name;

-- 2. Check new columns in tasting_records
SELECT '=== NEW COLUMNS IN TASTING_RECORDS ===' as section;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasting_records'
AND column_name IN (
    'personal_insights',
    'vocabulary_used',
    'difficulty_level',
    'learning_points',
    'taste_confidence'
);

-- 3. Count achievement definitions
SELECT '=== ACHIEVEMENT DEFINITIONS COUNT ===' as section;
SELECT COUNT(*) as total_achievements 
FROM achievement_definitions;

-- 4. Show some achievements
SELECT '=== SAMPLE ACHIEVEMENTS ===' as section;
SELECT achievement_type, title, category, rarity
FROM achievement_definitions
LIMIT 5;

-- 5. Check if views exist
SELECT '=== CHECKING VIEWS ===' as section;
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('user_progress_overview', 'flavor_mastery_summary');

-- 6. Summary
SELECT '=== MIGRATION SUMMARY ===' as section;
SELECT 
    'Tables Created' as item,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_taste_profiles',
    'flavor_learning_progress', 
    'user_achievements',
    'daily_taste_stats',
    'achievement_definitions'
)
UNION ALL
SELECT 
    'New Columns Added',
    COUNT(*)
FROM information_schema.columns
WHERE table_name = 'tasting_records'
AND column_name IN (
    'personal_insights',
    'vocabulary_used',
    'difficulty_level',
    'learning_points',
    'taste_confidence'
)
UNION ALL
SELECT 
    'Views Created',
    COUNT(*)
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('user_progress_overview', 'flavor_mastery_summary');