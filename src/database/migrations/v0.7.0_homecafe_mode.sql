-- Home Cafe Mode Support
-- Version: 0.7.0
-- Date: 2025-07-23

-- Add mode and home_cafe_data columns to tasting_records table
ALTER TABLE tasting_records 
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'cafe' CHECK (mode IN ('cafe', 'home_cafe'));

ALTER TABLE tasting_records 
ADD COLUMN IF NOT EXISTS home_cafe_data JSONB;

-- Add indexes for mode filtering
CREATE INDEX IF NOT EXISTS idx_tasting_records_mode ON tasting_records(mode);
CREATE INDEX IF NOT EXISTS idx_tasting_records_home_cafe_data ON tasting_records USING GIN (home_cafe_data) WHERE home_cafe_data IS NOT NULL;

-- Update temperature constraint to include 'cold'
ALTER TABLE tasting_records DROP CONSTRAINT IF EXISTS tasting_records_temperature_check;
ALTER TABLE tasting_records 
ADD CONSTRAINT tasting_records_temperature_check 
CHECK (temperature IN ('hot', 'ice', 'cold'));

-- Add bitterness and balance columns to sensory_attributes table
ALTER TABLE sensory_attributes
ADD COLUMN IF NOT EXISTS bitterness INTEGER CHECK (bitterness >= 1 AND bitterness <= 5);

ALTER TABLE sensory_attributes
ADD COLUMN IF NOT EXISTS balance INTEGER CHECK (balance >= 1 AND balance <= 5);

-- Add selected_sensory_expressions column to tasting_records table
ALTER TABLE tasting_records 
ADD COLUMN IF NOT EXISTS selected_sensory_expressions JSONB DEFAULT '[]';

-- Create a view for home cafe statistics
CREATE OR REPLACE VIEW home_cafe_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE mode = 'home_cafe') as total_home_cafe_tastings,
  COUNT(*) FILTER (WHERE mode = 'cafe') as total_cafe_tastings,
  home_cafe_data->>'equipment'->>'brewingMethod' as brewing_method,
  COUNT(*) as brewing_method_count,
  AVG((home_cafe_data->>'recipe'->>'waterTemp')::NUMERIC) as avg_water_temp,
  AVG((home_cafe_data->>'recipe'->>'totalBrewTime')::NUMERIC) as avg_brew_time,
  AVG(match_score_total) FILTER (WHERE mode = 'home_cafe') as avg_home_cafe_score,
  AVG(match_score_total) FILTER (WHERE mode = 'cafe') as avg_cafe_score
FROM tasting_records
WHERE is_deleted = FALSE
GROUP BY user_id, brewing_method;

-- Grant permissions
GRANT SELECT ON home_cafe_stats TO authenticated;

-- Sample home_cafe_data structure for reference:
COMMENT ON COLUMN tasting_records.home_cafe_data IS '
{
  "equipment": {
    "grinder": {
      "brand": "Commandante",
      "model": "C40",
      "setting": "15 clicks"
    },
    "brewingMethod": "V60",
    "filter": "Hario white",
    "other": "Hario glass V60-02"
  },
  "recipe": {
    "doseIn": 20,
    "waterAmount": 320,
    "ratio": "1:16",
    "waterTemp": 93,
    "bloomTime": 30,
    "totalBrewTime": 240,
    "pourPattern": "3 pours: 60g, 130g, 130g"
  },
  "notes": {
    "previousChange": "Grind 1 click coarser",
    "result": "Increased clarity, reduced bitterness",
    "nextExperiment": "Try lower water temperature (90°C)"
  }
}';