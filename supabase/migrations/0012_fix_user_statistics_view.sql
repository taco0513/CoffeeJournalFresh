-- Migration: Fix user_statistics view SECURITY DEFINER issue
-- Description: Completely drop and recreate user_statistics view without SECURITY DEFINER
-- Date: 2025-01-26

-- =====================================================
-- PART 1: Completely drop the problematic view
-- =====================================================

-- Drop the view completely with CASCADE to remove dependencies
DROP VIEW IF EXISTS public.user_statistics CASCADE;

-- =====================================================
-- PART 2: Recreate view without SECURITY DEFINER
-- =====================================================

-- Create a simple view without SECURITY DEFINER
-- This view will respect RLS policies of the underlying tables
CREATE VIEW public.user_statistics AS
SELECT 
    t.user_id,
    COUNT(DISTINCT t.id) AS total_tastings,
    COUNT(DISTINCT t.coffee_name) AS unique_coffees,
    COUNT(DISTINCT t.cafe_name) AS unique_cafes,
    AVG(t.match_score_total) AS avg_rating,
    MAX(t.created_at) AS last_tasting_date,
    COUNT(DISTINCT DATE(t.created_at)) AS active_days
FROM public.tasting_records t
WHERE (t.is_deleted = false OR t.is_deleted IS NULL)
GROUP BY t.user_id;

-- =====================================================
-- PART 3: Grant permissions
-- =====================================================

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.user_statistics TO authenticated;

-- =====================================================
-- PART 4: Add comments
-- =====================================================

COMMENT ON VIEW public.user_statistics IS 'User statistics view without SECURITY DEFINER - respects RLS policies of underlying tables';