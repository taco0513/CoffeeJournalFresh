-- Community Features Schema for Coffee Journal
-- This file contains all community-related tables for shared reviews and recommendations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (public information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 160),
  level INTEGER DEFAULT 1,
  total_tastings INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (private settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications JSONB DEFAULT '{
    "push": true,
    "email": false,
    "new_follower": true,
    "challenge_invite": true,
    "weekly_report": true,
    "community_mentions": true,
    "achievement_unlocked": true
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow relationships
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Shared coffee reviews
CREATE TABLE IF NOT EXISTS community_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Coffee information
  roastery TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  variety TEXT,
  process TEXT,
  altitude TEXT,
  -- Review data
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  flavor_notes TEXT[],
  sensory_scores JSONB, -- {body, acidity, sweetness, finish}
  brew_method TEXT,
  review_text TEXT,
  photos TEXT[], -- Array of photo URLs
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review likes
CREATE TABLE IF NOT EXISTS review_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES community_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, review_id)
);

-- Review comments
CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES community_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coffee master database (crowd-sourced)
CREATE TABLE IF NOT EXISTS coffee_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roastery TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  region TEXT,
  variety TEXT,
  process TEXT,
  altitude TEXT,
  harvest_year INTEGER,
  -- Aggregated data
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  common_flavor_notes TEXT[],
  avg_sensory_scores JSONB,
  -- Metadata
  first_added_by UUID REFERENCES auth.users(id),
  verified_by_moderator BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(roastery, coffee_name, origin, variety, process)
);

-- Coffee recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coffee_id UUID REFERENCES coffee_catalog(id) ON DELETE CASCADE,
  recommendation_type TEXT CHECK (recommendation_type IN ('similar_taste', 'trending', 'personalized', 'editor_pick')),
  score DECIMAL(3,2), -- Recommendation strength
  reason TEXT, -- Why this was recommended
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_community_reviews_user_id ON community_reviews(user_id);
CREATE INDEX idx_community_reviews_coffee ON community_reviews(roastery, coffee_name);
CREATE INDEX idx_community_reviews_created_at ON community_reviews(created_at DESC);
CREATE INDEX idx_coffee_catalog_search ON coffee_catalog(roastery, coffee_name, origin);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id, expires_at);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User profiles: Public read, owner write
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- User preferences: Owner only
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Community reviews: Public read, authenticated write
CREATE POLICY "Public reviews are viewable by everyone"
  ON community_reviews FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON community_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON community_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON community_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Recommendations: User specific
CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Functions for aggregations
CREATE OR REPLACE FUNCTION update_coffee_catalog_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coffee_catalog
  SET 
    avg_rating = (
      SELECT AVG(overall_rating) 
      FROM community_reviews 
      WHERE roastery = NEW.roastery 
        AND coffee_name = NEW.coffee_name
        AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM community_reviews 
      WHERE roastery = NEW.roastery 
        AND coffee_name = NEW.coffee_name
        AND is_public = true
    ),
    common_flavor_notes = (
      SELECT ARRAY_AGG(DISTINCT flavor) 
      FROM (
        SELECT UNNEST(flavor_notes) as flavor
        FROM community_reviews 
        WHERE roastery = NEW.roastery 
          AND coffee_name = NEW.coffee_name
          AND is_public = true
      ) t
      LIMIT 10
    )
  WHERE roastery = NEW.roastery AND coffee_name = NEW.coffee_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update coffee catalog stats
CREATE TRIGGER update_coffee_stats_on_review
AFTER INSERT OR UPDATE ON community_reviews
FOR EACH ROW
EXECUTE FUNCTION update_coffee_catalog_stats();

-- Function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_recommendations(p_user_id UUID)
RETURNS TABLE (
  coffee_id UUID,
  roastery TEXT,
  coffee_name TEXT,
  avg_rating DECIMAL,
  recommendation_type TEXT,
  score DECIMAL,
  reason TEXT
) AS $$
BEGIN
  -- Clear old recommendations
  DELETE FROM recommendations 
  WHERE user_id = p_user_id AND expires_at < NOW();
  
  -- Return existing valid recommendations
  RETURN QUERY
  SELECT 
    r.coffee_id,
    c.roastery,
    c.coffee_name,
    c.avg_rating,
    r.recommendation_type,
    r.score,
    r.reason
  FROM recommendations r
  JOIN coffee_catalog c ON c.id = r.coffee_id
  WHERE r.user_id = p_user_id 
    AND r.expires_at > NOW()
  ORDER BY r.score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- View for trending coffees
CREATE OR REPLACE VIEW trending_coffees AS
SELECT 
  c.id,
  c.roastery,
  c.coffee_name,
  c.origin,
  c.avg_rating,
  c.total_reviews,
  COUNT(DISTINCT r.user_id) as recent_reviewers,
  COUNT(DISTINCT CASE WHEN r.created_at > NOW() - INTERVAL '7 days' THEN r.id END) as recent_reviews
FROM coffee_catalog c
JOIN community_reviews r ON r.roastery = c.roastery AND r.coffee_name = c.coffee_name
WHERE r.created_at > NOW() - INTERVAL '30 days'
  AND r.is_public = true
GROUP BY c.id, c.roastery, c.coffee_name, c.origin, c.avg_rating, c.total_reviews
HAVING COUNT(DISTINCT r.user_id) >= 3
ORDER BY recent_reviews DESC, c.avg_rating DESC;

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id,
  u.username,
  u.total_tastings,
  COUNT(DISTINCT r.id) as public_reviews,
  AVG(r.overall_rating) as avg_rating_given,
  COUNT(DISTINCT r.roastery) as unique_roasteries,
  COUNT(DISTINCT r.origin) as unique_origins,
  ARRAY_AGG(DISTINCT r.brew_method) FILTER (WHERE r.brew_method IS NOT NULL) as brew_methods_used
FROM user_profiles u
LEFT JOIN community_reviews r ON r.user_id = u.id AND r.is_public = true
GROUP BY u.id, u.username, u.total_tastings;