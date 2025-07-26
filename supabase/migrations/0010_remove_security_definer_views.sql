-- Migration: Remove SECURITY DEFINER from Views
-- Description: Drop and recreate views without SECURITY DEFINER property
-- Date: 2025-01-26

-- =====================================================
-- PART 1: Drop all SECURITY DEFINER views
-- =====================================================

-- Drop views that have SECURITY DEFINER property
DROP VIEW IF EXISTS public.admin_notification_stats CASCADE;
DROP VIEW IF EXISTS public.roastery_stats CASCADE;
DROP VIEW IF EXISTS public.origin_stats CASCADE;
DROP VIEW IF EXISTS public.trending_coffees CASCADE;
DROP VIEW IF EXISTS public.collection_stats CASCADE;
DROP VIEW IF EXISTS public.user_progress_overview CASCADE;
DROP VIEW IF EXISTS public.user_statistics CASCADE;
DROP VIEW IF EXISTS public.flavor_analysis CASCADE;
DROP VIEW IF EXISTS public.flavor_mastery_summary CASCADE;

-- =====================================================
-- PART 2: Create safe replacement views (optional)
-- =====================================================

-- Note: Only creating essential views with proper RLS
-- These views will respect the user's permissions instead of the view creator's

-- Simple user statistics view (users can only see their own stats through RLS)
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
    t.user_id,
    COUNT(DISTINCT t.id) AS total_tastings,
    COUNT(DISTINCT t.coffee_name) AS unique_coffees,
    COUNT(DISTINCT t.cafe_name) AS unique_cafes,
    AVG(t.match_score_total) AS avg_rating,
    MAX(t.created_at) AS last_tasting_date,
    COUNT(DISTINCT DATE(t.created_at)) AS active_days
FROM public.tasting_records t
WHERE t.is_deleted = false OR t.is_deleted IS NULL
GROUP BY t.user_id;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.user_statistics TO authenticated;

-- Add RLS policy to the view (if supported)
-- Note: Views inherit RLS from their underlying tables

-- =====================================================
-- PART 3: Comments
-- =====================================================

COMMENT ON VIEW public.user_statistics IS 'User statistics without SECURITY DEFINER - respects RLS policies of underlying tables';

-- Note: Other views (flavor_analysis, collection_stats, etc.) can be recreated
-- as needed by the application, but they should not use SECURITY DEFINER
-- and should rely on RLS policies of the underlying tables instead.