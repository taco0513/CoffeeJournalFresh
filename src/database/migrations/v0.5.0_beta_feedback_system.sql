-- Beta Feedback System Migration
-- Version: 0.5.0
-- Date: 2025-07-20

-- Beta users table
CREATE TABLE IF NOT EXISTS beta_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_beta_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_count INTEGER DEFAULT 0,
  last_feedback_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback items table
CREATE TABLE IF NOT EXISTS feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  username TEXT,
  category TEXT CHECK (category IN ('bug', 'improvement', 'idea', 'praise')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  device_info JSONB NOT NULL,
  context JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in-progress', 'resolved', 'closed')),
  admin_notes TEXT,
  is_beta_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback analytics view
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN category = 'bug' THEN 1 END) as bug_count,
  COUNT(CASE WHEN category = 'improvement' THEN 1 END) as improvement_count,
  COUNT(CASE WHEN category = 'idea' THEN 1 END) as idea_count,
  COUNT(CASE WHEN category = 'praise' THEN 1 END) as praise_count,
  AVG(rating)::NUMERIC(3,2) as average_rating,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN is_beta_user THEN 1 END) as beta_feedback_count
FROM feedback_items;

-- Admin notifications for new feedback
CREATE TABLE IF NOT EXISTS feedback_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_items(id) ON DELETE CASCADE,
  notification_type TEXT DEFAULT 'new_feedback',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_user_id ON feedback_items(user_id);
CREATE INDEX idx_feedback_category ON feedback_items(category);
CREATE INDEX idx_feedback_status ON feedback_items(status);
CREATE INDEX idx_feedback_created_at ON feedback_items(created_at DESC);
CREATE INDEX idx_beta_users_active ON beta_users(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_notifications ENABLE ROW LEVEL SECURITY;

-- Beta users policies
CREATE POLICY "Users can view their own beta status" ON beta_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage beta users" ON beta_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'hello@zimojin.com'
    )
  );

-- Feedback policies
CREATE POLICY "Users can create feedback" ON feedback_items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback" ON feedback_items
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all feedback" ON feedback_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'hello@zimojin.com'
    )
  );

CREATE POLICY "Admins can update feedback" ON feedback_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'hello@zimojin.com'
    )
  );

-- Notification policies
CREATE POLICY "Admins can view feedback notifications" ON feedback_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'hello@zimojin.com'
    )
  );

CREATE POLICY "Admins can update notification status" ON feedback_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'hello@zimojin.com'
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION increment_feedback_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beta_users 
  SET 
    feedback_count = feedback_count + 1,
    last_feedback_at = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Create notification for admins
  INSERT INTO feedback_notifications (feedback_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incrementing feedback count
CREATE TRIGGER trigger_increment_feedback
AFTER INSERT ON feedback_items
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION increment_feedback_count();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beta_users_updated_at
BEFORE UPDATE ON beta_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_items_updated_at
BEFORE UPDATE ON feedback_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();