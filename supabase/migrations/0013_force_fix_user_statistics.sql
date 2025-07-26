-- Migration: Force fix user_statistics view SECURITY DEFINER issue
-- Description: Aggressively remove and recreate user_statistics view
-- Date: 2025-01-26

-- =====================================================
-- PART 1: Check and drop any existing view
-- =====================================================

-- First, check if the view exists and drop it completely
DO $$
BEGIN
    -- Drop the view if it exists
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_statistics' AND table_schema = 'public') THEN
        EXECUTE 'DROP VIEW public.user_statistics CASCADE';
        RAISE NOTICE 'Dropped existing user_statistics view';
    END IF;
END $$;

-- Also try to drop any materialized view with the same name
DROP MATERIALIZED VIEW IF EXISTS public.user_statistics CASCADE;

-- =====================================================
-- PART 2: Wait a moment and recreate (simple approach)
-- =====================================================

-- Create a completely new view with a different structure first
CREATE OR REPLACE VIEW public.temp_user_statistics AS
SELECT 
    'temp' as status;

-- Drop the temporary view
DROP VIEW public.temp_user_statistics;

-- =====================================================
-- PART 3: Create the final view without any SECURITY DEFINER
-- =====================================================

-- Now create the actual view we want
CREATE VIEW public.user_statistics AS
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

-- =====================================================
-- PART 4: Grant permissions explicitly
-- =====================================================

-- Revoke all existing permissions first
REVOKE ALL ON public.user_statistics FROM PUBLIC;
REVOKE ALL ON public.user_statistics FROM authenticated;
REVOKE ALL ON public.user_statistics FROM anon;

-- Grant only SELECT to authenticated users
GRANT SELECT ON public.user_statistics TO authenticated;

-- =====================================================
-- PART 5: Verify the view was created correctly
-- =====================================================

-- Add a comment to verify it was recreated
COMMENT ON VIEW public.user_statistics IS 'User statistics view created without SECURITY DEFINER - completely rebuilt on 2025-01-26';

-- Check the view definition (this will show in the output)
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'user_statistics' AND schemaname = 'public';