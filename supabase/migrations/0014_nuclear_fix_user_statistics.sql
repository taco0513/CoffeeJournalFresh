-- Migration: Nuclear option - completely eliminate user_statistics view
-- Description: Remove all traces of user_statistics view
-- Date: 2025-01-26

-- =====================================================
-- OPTION 1: Complete elimination (recommended)
-- =====================================================

-- Drop the view completely and don't recreate it
DROP VIEW IF EXISTS public.user_statistics CASCADE;

-- Also check for any functions or other objects with this name
DROP FUNCTION IF EXISTS public.user_statistics() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_statistics CASCADE;

-- Check if there are any other objects with this name
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Look for any remaining objects with this name
    FOR rec IN 
        SELECT schemaname, tablename, 'table' as object_type FROM pg_tables WHERE tablename = 'user_statistics'
        UNION ALL
        SELECT schemaname, viewname, 'view' as object_type FROM pg_views WHERE viewname = 'user_statistics'
        UNION ALL
        SELECT schemaname, matviewname, 'matview' as object_type FROM pg_matviews WHERE matviewname = 'user_statistics'
    LOOP
        RAISE NOTICE 'Found object: %.% (type: %)', rec.schemaname, rec.tablename, rec.object_type;
    END LOOP;
END $$;

-- =====================================================
-- OPTION 2: Alternative - Create with different name
-- =====================================================

-- Create a replacement view with a different name
CREATE VIEW public.user_tasting_stats AS
SELECT 
    t.user_id,
    COUNT(DISTINCT t.id) AS total_tastings,
    COUNT(DISTINCT t.coffee_name) AS unique_coffees,
    COUNT(DISTINCT t.cafe_name) AS unique_cafes,
    COALESCE(AVG(t.match_score_total), 0) AS avg_rating,
    MAX(t.created_at) AS last_tasting_date,
    COUNT(DISTINCT DATE(t.created_at)) AS active_days
FROM public.tasting_records t
WHERE (t.is_deleted IS NULL OR t.is_deleted = false)
GROUP BY t.user_id;

-- Grant permissions to the new view
GRANT SELECT ON public.user_tasting_stats TO authenticated;

COMMENT ON VIEW public.user_tasting_stats IS 'User statistics view with different name to avoid SECURITY DEFINER cache issues';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show what views exist now
SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('user_statistics', 'user_tasting_stats')
ORDER BY viewname;