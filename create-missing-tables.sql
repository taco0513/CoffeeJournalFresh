-- Create only missing tables for Coffee Journal

-- 1. Roaster info (personal user data)
CREATE TABLE IF NOT EXISTS roaster_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  website TEXT,
  notes TEXT,
  visit_count INTEGER DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cafe info (personal user data)
CREATE TABLE IF NOT EXISTS cafe_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  visit_count INTEGER DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin notifications (if not exists)
-- This might already exist from admin-notifications.sql
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_coffee_review', 'coffee_edit_review', 'user_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE roaster_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roaster_info
CREATE POLICY "Users can manage their own roaster info" ON roaster_info
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cafe_info  
CREATE POLICY "Users can manage their own cafe info" ON cafe_info
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roaster_info_user_id ON roaster_info(user_id);
CREATE INDEX IF NOT EXISTS idx_roaster_info_name ON roaster_info(name);
CREATE INDEX IF NOT EXISTS idx_cafe_info_user_id ON cafe_info(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_info_name ON cafe_info(name);