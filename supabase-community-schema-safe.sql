-- Safe version of community schema - skips existing objects

-- Check and create indexes only if they don't exist
DO $$ 
BEGIN
  -- Check for idx_user_profiles_username
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_username') THEN
    CREATE INDEX idx_user_profiles_username ON user_profiles(username);
  END IF;
  
  -- Check for idx_community_reviews_user_id
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_community_reviews_user_id') THEN
    CREATE INDEX idx_community_reviews_user_id ON community_reviews(user_id);
  END IF;
  
  -- Check for idx_community_reviews_coffee
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_community_reviews_coffee') THEN
    CREATE INDEX idx_community_reviews_coffee ON community_reviews(roastery, coffee_name);
  END IF;
  
  -- Check for idx_community_reviews_created_at
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_community_reviews_created_at') THEN
    CREATE INDEX idx_community_reviews_created_at ON community_reviews(created_at DESC);
  END IF;
  
  -- Check for idx_coffee_catalog_search
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_coffee_catalog_search') THEN
    CREATE INDEX idx_coffee_catalog_search ON coffee_catalog(roastery, coffee_name, origin);
  END IF;
  
  -- Check for idx_recommendations_user_id
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recommendations_user_id') THEN
    CREATE INDEX idx_recommendations_user_id ON recommendations(user_id, expires_at);
  END IF;
END $$;

-- Continue with the rest of the schema (RLS policies, functions, etc.)
-- Copy lines 143 onwards from the original file if needed