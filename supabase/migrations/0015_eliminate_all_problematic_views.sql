-- Migration: Eliminate all problematic views completely
-- Description: Remove all views that keep getting SECURITY DEFINER property
-- Date: 2025-01-26

-- =====================================================
-- COMPLETE VIEW ELIMINATION
-- =====================================================

-- Drop all potentially problematic views
DROP VIEW IF EXISTS public.user_statistics CASCADE;
DROP VIEW IF EXISTS public.user_tasting_stats CASCADE;
DROP VIEW IF EXISTS public.flavor_mastery_summary CASCADE;
DROP VIEW IF EXISTS public.flavor_analysis CASCADE;
DROP VIEW IF EXISTS public.user_progress_overview CASCADE;
DROP VIEW IF EXISTS public.collection_stats CASCADE;
DROP VIEW IF EXISTS public.trending_coffees CASCADE;
DROP VIEW IF EXISTS public.origin_stats CASCADE;
DROP VIEW IF EXISTS public.roastery_stats CASCADE;
DROP VIEW IF EXISTS public.admin_notification_stats CASCADE;

-- Also drop any materialized views with these names
DROP MATERIALIZED VIEW IF EXISTS public.user_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_tasting_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.flavor_mastery_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.flavor_analysis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_progress_overview CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.collection_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.trending_coffees CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.origin_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.roastery_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.admin_notification_stats CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- List all remaining views to confirm they're gone
SELECT 
    schemaname,
    viewname,
    'view' as object_type
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN (
        'user_statistics', 'user_tasting_stats', 
        'flavor_mastery_summary', 'flavor_analysis',
        'user_progress_overview', 'collection_stats',
        'trending_coffees', 'origin_stats', 
        'roastery_stats', 'admin_notification_stats'
    )
UNION ALL
SELECT 
    schemaname,
    matviewname,
    'materialized_view' as object_type
FROM pg_matviews 
WHERE schemaname = 'public' 
    AND matviewname IN (
        'user_statistics', 'user_tasting_stats',
        'flavor_mastery_summary', 'flavor_analysis',
        'user_progress_overview', 'collection_stats',
        'trending_coffees', 'origin_stats',
        'roastery_stats', 'admin_notification_stats'
    )
ORDER BY object_type, schemaname;

-- =====================================================
-- COMMENTS
-- =====================================================

-- Add a comment to track what we did
COMMENT ON SCHEMA public IS 'All problematic SECURITY DEFINER views removed on 2025-01-26 due to persistent security issues';