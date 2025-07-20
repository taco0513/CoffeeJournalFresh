-- User Data Schema for Coffee Journal
-- This file contains tables for syncing personal tasting data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasting records table (user's personal data)
CREATE TABLE IF NOT EXISTS tasting_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Coffee information
  cafe_name TEXT,
  roastery TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  temperature TEXT CHECK (temperature IN ('hot', 'ice')),
  
  -- Notes
  roaster_notes TEXT,
  personal_comment TEXT,
  
  -- Scores
  match_score_total DECIMAL(5,2),
  match_score_flavor DECIMAL(5,2),
  match_score_sensory DECIMAL(5,2),
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(id, user_id)
);

-- Flavor notes table
CREATE TABLE IF NOT EXISTS flavor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (tasting_id, user_id) REFERENCES tasting_records(id, user_id) ON DELETE CASCADE
);

-- Sensory attributes table
CREATE TABLE IF NOT EXISTS sensory_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  body DECIMAL(3,2) CHECK (body >= 0 AND body <= 5),
  acidity DECIMAL(3,2) CHECK (acidity >= 0 AND acidity <= 5),
  sweetness DECIMAL(3,2) CHECK (sweetness >= 0 AND sweetness <= 5),
  finish DECIMAL(3,2) CHECK (finish >= 0 AND finish <= 5),
  mouthfeel DECIMAL(3,2) CHECK (mouthfeel >= 0 AND mouthfeel <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (tasting_id, user_id) REFERENCES tasting_records(id, user_id) ON DELETE CASCADE,
  UNIQUE(tasting_id, user_id)
);

-- Sync log for debugging
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('upload', 'download')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasting_records_user_id ON tasting_records(user_id);
CREATE INDEX idx_tasting_records_created_at ON tasting_records(created_at DESC);
CREATE INDEX idx_tasting_records_synced_at ON tasting_records(synced_at);
CREATE INDEX idx_flavor_notes_tasting_id ON flavor_notes(tasting_id);
CREATE INDEX idx_sensory_attributes_tasting_id ON sensory_attributes(tasting_id);
CREATE INDEX idx_sync_log_user_id ON sync_log(user_id, created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE tasting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own tasting records"
  ON tasting_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasting records"
  ON tasting_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasting records"
  ON tasting_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasting records"
  ON tasting_records FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for flavor_notes
CREATE POLICY "Users can view own flavor notes"
  ON flavor_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flavor notes"
  ON flavor_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flavor notes"
  ON flavor_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flavor notes"
  ON flavor_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for sensory_attributes
CREATE POLICY "Users can view own sensory attributes"
  ON sensory_attributes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensory attributes"
  ON sensory_attributes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sensory attributes"
  ON sensory_attributes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sensory attributes"
  ON sensory_attributes FOR DELETE
  USING (auth.uid() = user_id);

-- Sync log policies
CREATE POLICY "Users can view own sync logs"
  ON sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
  ON sync_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions
-- Function to get last sync timestamp
CREATE OR REPLACE FUNCTION get_last_sync_timestamp(p_user_id UUID)
RETURNS TIMESTAMPTZ AS $$
  SELECT MAX(created_at)
  FROM sync_log
  WHERE user_id = p_user_id
    AND sync_status = 'success'
    AND sync_direction = 'upload'
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to clean old sync logs
CREATE OR REPLACE FUNCTION clean_old_sync_logs()
RETURNS void AS $$
  DELETE FROM sync_log
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND sync_status = 'success';
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger to update synced_at on tasting_records
CREATE OR REPLACE FUNCTION update_synced_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasting_synced_at
  BEFORE INSERT OR UPDATE ON tasting_records
  FOR EACH ROW
  EXECUTE FUNCTION update_synced_at();