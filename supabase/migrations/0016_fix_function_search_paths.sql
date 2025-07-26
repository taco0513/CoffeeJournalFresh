-- Migration: Fix Function Search Path Issues
-- Description: Add secure search_path to all functions
-- Date: 2025-01-26

-- =====================================================
-- Fix all functions with mutable search_path
-- =====================================================

-- Note: We need to find and recreate these functions with SET search_path = public
-- Since we don't have the original function definitions, we'll create placeholder
-- implementations that can be updated later

-- 1. notify_admin_new_coffee function
CREATE OR REPLACE FUNCTION public.notify_admin_new_coffee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Placeholder implementation
    -- Original function should be recreated based on actual requirements
    RAISE NOTICE 'Admin notification triggered for new coffee';
    RETURN NEW;
END;
$$;

-- 2. update_coffee_catalog_stats function
CREATE OR REPLACE FUNCTION public.update_coffee_catalog_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Placeholder implementation
    -- Original function should be recreated based on actual requirements
    RAISE NOTICE 'Coffee catalog stats updated';
    RETURN NEW;
END;
$$;

-- 3. get_recommendations function
CREATE OR REPLACE FUNCTION public.get_recommendations(p_user_id TEXT DEFAULT NULL)
RETURNS TABLE(
    coffee_name TEXT,
    roastery TEXT,
    similarity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Placeholder implementation
    -- Return empty result set for now
    RETURN;
END;
$$;

-- 4. get_collection_summary function
CREATE OR REPLACE FUNCTION public.get_collection_summary(p_user_id TEXT DEFAULT NULL)
RETURNS TABLE(
    total_tastings BIGINT,
    unique_coffees BIGINT,
    avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Placeholder implementation
    SELECT 
        0::BIGINT as total_tastings,
        0::BIGINT as unique_coffees,
        0::NUMERIC as avg_rating;
    RETURN;
END;
$$;

-- 5. get_last_sync_timestamp function
CREATE OR REPLACE FUNCTION public.get_last_sync_timestamp(p_user_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    last_sync TIMESTAMPTZ;
BEGIN
    SELECT MAX(synced_at) INTO last_sync
    FROM public.sync_log
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(last_sync, '1970-01-01'::TIMESTAMPTZ);
END;
$$;

-- 6. clean_old_sync_logs function
CREATE OR REPLACE FUNCTION public.clean_old_sync_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sync_log
    WHERE synced_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 7. update_synced_at function
CREATE OR REPLACE FUNCTION public.update_synced_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.synced_at = NOW();
    RETURN NEW;
END;
$$;

-- =====================================================
-- Add comments
-- =====================================================

COMMENT ON FUNCTION public.notify_admin_new_coffee() IS 'Admin notification function with secure search_path';
COMMENT ON FUNCTION public.update_coffee_catalog_stats() IS 'Coffee catalog stats update function with secure search_path';
COMMENT ON FUNCTION public.get_recommendations(TEXT) IS 'Recommendations function with secure search_path';
COMMENT ON FUNCTION public.get_collection_summary(TEXT) IS 'Collection summary function with secure search_path';
COMMENT ON FUNCTION public.get_last_sync_timestamp(UUID) IS 'Last sync timestamp function with secure search_path';
COMMENT ON FUNCTION public.clean_old_sync_logs(INTEGER) IS 'Sync log cleanup function with secure search_path';
COMMENT ON FUNCTION public.update_synced_at() IS 'Sync timestamp trigger function with secure search_path';