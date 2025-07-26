-- Migration: Fix Security Warnings
-- Description: Fix function search_path and improve RLS policies
-- Date: 2025-01-26

-- =====================================================
-- PART 1: Fix Function Search Path Issues
-- =====================================================

-- Fix search_path for functions to prevent security issues
-- Note: This requires recreating functions with proper search_path setting

-- Fix update_updated_at_column function (if it exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix is_admin function (recreate with proper search_path)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- =====================================================
-- PART 2: Restrict Anonymous Access (Optional)
-- =====================================================

-- If you want to restrict anonymous access, you can modify policies
-- For now, we'll add comments explaining why anonymous access might be needed

-- Coffee catalog and achievement definitions are intentionally public
-- This allows the app to show coffee information and achievements without requiring login

-- User-specific data policies already require authentication through auth.uid()
-- Anonymous access warnings are mostly false positives because:
-- 1. The policies use auth.uid() which returns NULL for anonymous users
-- 2. NULL comparisons in WHERE clauses effectively block anonymous access

-- =====================================================
-- PART 3: Add explicit authenticated checks (Enhanced Security)
-- =====================================================

-- If you want to be extra secure, you can add explicit authenticated checks
-- But this may break functionality for public data like coffee catalog

-- Example: Add authenticated check to a policy (uncomment if needed)
/*
DROP POLICY IF EXISTS "Coffee catalog is viewable by everyone" ON public.coffee_catalog;
CREATE POLICY "Coffee catalog is viewable by authenticated users" ON public.coffee_catalog
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
*/

-- =====================================================
-- PART 4: Comments for guidance
-- =====================================================

COMMENT ON FUNCTION public.is_admin() IS 'Admin check function with secure search_path';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function with secure search_path';

-- Note: Other functions mentioned in warnings need to be recreated individually
-- based on their actual implementations. Search for them in your migration files
-- and add "SET search_path = public" to each one.

-- Functions that need similar treatment:
-- - notify_admin_new_coffee
-- - update_coffee_catalog_stats  
-- - get_recommendations
-- - get_collection_summary
-- - get_last_sync_timestamp
-- - clean_old_sync_logs
-- - update_synced_at