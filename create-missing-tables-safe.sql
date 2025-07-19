-- Create only missing tables with safety checks

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

-- Enable RLS only if not already enabled
DO $$ 
BEGIN
  -- Enable RLS for roaster_info if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roaster_info') THEN
    ALTER TABLE roaster_info ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for cafe_info if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cafe_info') THEN
    ALTER TABLE cafe_info ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  -- Policy for roaster_info
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'roaster_info' 
    AND policyname = 'Users can manage their own roaster info'
  ) THEN
    CREATE POLICY "Users can manage their own roaster info" ON roaster_info
      FOR ALL USING (auth.uid() = user_id);
  END IF;
  
  -- Policy for cafe_info
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cafe_info' 
    AND policyname = 'Users can manage their own cafe info'
  ) THEN
    CREATE POLICY "Users can manage their own cafe info" ON cafe_info
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_roaster_info_user_id ON roaster_info(user_id);
CREATE INDEX IF NOT EXISTS idx_roaster_info_name ON roaster_info(name);
CREATE INDEX IF NOT EXISTS idx_cafe_info_user_id ON cafe_info(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_info_name ON cafe_info(name);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Missing tables creation completed successfully!';
END $$;