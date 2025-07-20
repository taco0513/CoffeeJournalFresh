-- =============================================
-- Current Database Schema Check
-- Shows what tables and columns actually exist
-- =============================================

-- 1. List ALL tables in your database
SELECT '=== ALL TABLES IN DATABASE ===' as section;
SELECT table_name, 
       CASE 
         WHEN table_name LIKE '%taste%' OR table_name LIKE '%achievement%' OR table_name LIKE '%flavor%' THEN '🆕 v0.4.0'
         WHEN table_name LIKE '%coffee%' OR table_name LIKE '%tasting%' THEN '☕ Core'
         WHEN table_name LIKE '%user%' OR table_name LIKE '%profile%' THEN '👤 User'
         ELSE '📦 Other'
       END as category
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY category, table_name;

-- 2. Check for duplicate or similar tables
SELECT '=== POTENTIAL DUPLICATE TABLES ===' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%coffee%catalog%' OR
    table_name LIKE '%tasting%record%' OR
    table_name LIKE '%user%profile%'
)
ORDER BY table_name;

-- 3. Check tasting_records structure (might have different versions)
SELECT '=== TASTING_RECORDS COLUMNS ===' as section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasting_records'
ORDER BY ordinal_position;

-- 4. Count rows in key tables
SELECT '=== ROW COUNTS IN KEY TABLES ===' as section;
SELECT 'tasting_records' as table_name, COUNT(*) as row_count FROM tasting_records
UNION ALL
SELECT 'user_taste_profiles', COUNT(*) FROM user_taste_profiles
UNION ALL
SELECT 'achievement_definitions', COUNT(*) FROM achievement_definitions
UNION ALL
SELECT 'coffee_catalog', COUNT(*) FROM coffee_catalog
ORDER BY table_name;

-- 5. Check for orphaned or test data
SELECT '=== CHECK FOR TEST/DUPLICATE SCHEMAS ===' as section;
SELECT DISTINCT table_schema 
FROM information_schema.tables 
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema;