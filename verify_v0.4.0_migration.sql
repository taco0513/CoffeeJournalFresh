-- =============================================
-- v0.4.0 Migration Verification Script
-- Run this after applying the migration
-- =============================================

-- 1. Check if all new tables exist
SELECT 'Checking new tables...' as status;
SELECT 
    required_tables.table_name,
    CASE 
        WHEN ist.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('user_taste_profiles'),
        ('flavor_learning_progress'),
        ('user_achievements'),
        ('daily_taste_stats'),
        ('achievement_definitions')
) AS required_tables(table_name)
LEFT JOIN information_schema.tables ist 
    ON ist.table_name = required_tables.table_name 
    AND ist.table_schema = 'public'
ORDER BY required_tables.table_name;

-- 2. Check if new columns were added to tasting_records
SELECT 'Checking tasting_records columns...' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasting_records'
AND column_name IN ('personal_insights', 'vocabulary_used', 'difficulty_level', 'learning_points', 'taste_confidence')
ORDER BY column_name;

-- 3. Check indexes
SELECT 'Checking indexes...' as status;
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_taste_profiles_user_id',
    'idx_learning_progress_user_id',
    'idx_learning_progress_category',
    'idx_achievements_user_id',
    'idx_achievements_type',
    'idx_daily_stats_user_date',
    'idx_tasting_learning_points'
)
ORDER BY indexname;

-- 4. Check views
SELECT 'Checking views...' as status;
SELECT 
    viewname,
    CASE 
        WHEN viewname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('user_progress_overview', 'flavor_mastery_summary');

-- 5. Check achievement definitions data
SELECT 'Checking achievement definitions...' as status;
SELECT 
    achievement_type,
    title,
    category,
    rarity
FROM achievement_definitions
ORDER BY category, achievement_type
LIMIT 10;

-- 6. Count total achievements loaded
SELECT 'Total achievements loaded:' as status, COUNT(*) as count
FROM achievement_definitions;

-- 7. Check triggers
SELECT 'Checking triggers...' as status;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'update_user_taste_profiles_updated_at';

-- 8. Final summary
SELECT 'Migration Summary' as status;
WITH table_counts AS (
    SELECT 
        'user_taste_profiles' as table_name,
        COUNT(*) as row_count
    FROM user_taste_profiles
    UNION ALL
    SELECT 
        'flavor_learning_progress',
        COUNT(*)
    FROM flavor_learning_progress
    UNION ALL
    SELECT 
        'user_achievements',
        COUNT(*)
    FROM user_achievements
    UNION ALL
    SELECT 
        'daily_taste_stats',
        COUNT(*)
    FROM daily_taste_stats
    UNION ALL
    SELECT 
        'achievement_definitions',
        COUNT(*)
    FROM achievement_definitions
)
SELECT 
    table_name,
    row_count,
    CASE 
        WHEN table_name = 'achievement_definitions' AND row_count > 0 THEN '✅ Has initial data'
        WHEN table_name != 'achievement_definitions' THEN '✅ Ready for use'
        ELSE '⚠️ No data'
    END as status
FROM table_counts
ORDER BY table_name;