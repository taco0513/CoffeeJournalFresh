-- Pourover-Focused Home Cafe Mode Update
-- Version: 0.8.0
-- Date: 2025-07-24
-- Description: Update home_cafe_data structure for pourover-specific brewing

-- Update the comment on home_cafe_data column to reflect new pourover-focused structure
COMMENT ON COLUMN tasting_records.home_cafe_data IS '
Pourover-specific brewing data structure:
{
  "equipment": {
    "dripper": "V60" | "KalitaWave" | "Origami" | "Chemex" | "FellowStagg" | "April" | "Orea" | "FlowerDripper" | "BluebottleDripper" | "TimemoreCrystalEye" | "Other",
    "dripperSize": "01" | "02" | "03" | "155" | "185" | "S" | "M" | etc.,
    "filter": "bleached" | "natural" | "wave" | "chemex" | "metal" | "cloth",
    "grinder": {
      "brand": "Commandante",
      "model": "C40",
      "setting": "24 clicks"
    },
    "server": "Hario Range Server 600ml",
    "scale": "Acaia Pearl",
    "kettle": "Fellow Stagg EKG"
  },
  "recipe": {
    "doseIn": 15,
    "waterAmount": 250,
    "ratio": "1:16.7",
    "waterTemp": 93,
    "bloomWater": 30,
    "bloomTime": 30,
    "bloomAgitation": true,
    "pourTechnique": "center" | "spiral" | "pulse" | "continuous" | "multiStage",
    "numberOfPours": 3,
    "pourIntervals": [30, 60, 60],
    "totalBrewTime": 210,
    "drawdownTime": 30,
    "agitation": "none" | "stir" | "swirl" | "tap",
    "agitationTiming": "after last pour"
  },
  "notes": {
    "grindAdjustment": "2 clicks finer",
    "channeling": false,
    "mudBed": false,
    "tasteResult": "Clean, bright acidity, sweet finish",
    "nextExperiment": "Try 91°C water temperature"
  }
}';

-- Create indexes for pourover-specific queries
CREATE INDEX IF NOT EXISTS idx_tasting_records_dripper 
ON tasting_records ((home_cafe_data->'equipment'->>'dripper')) 
WHERE mode = 'home_cafe';

CREATE INDEX IF NOT EXISTS idx_tasting_records_pour_technique 
ON tasting_records ((home_cafe_data->'recipe'->>'pourTechnique')) 
WHERE mode = 'home_cafe';

-- Create a more detailed view for pourover statistics
CREATE OR REPLACE VIEW pourover_stats AS
SELECT 
  user_id,
  COUNT(*) as total_pourover_tastings,
  
  -- Dripper statistics
  home_cafe_data->'equipment'->>'dripper' as dripper,
  COUNT(*) as dripper_count,
  AVG(match_score_total) as avg_score_by_dripper,
  
  -- Recipe statistics
  AVG((home_cafe_data->'recipe'->>'doseIn')::NUMERIC) as avg_dose,
  AVG((home_cafe_data->'recipe'->>'waterAmount')::NUMERIC) as avg_water,
  MODE() WITHIN GROUP (ORDER BY home_cafe_data->'recipe'->>'ratio') as most_common_ratio,
  AVG((home_cafe_data->'recipe'->>'waterTemp')::NUMERIC) as avg_water_temp,
  AVG((home_cafe_data->'recipe'->>'totalBrewTime')::NUMERIC) as avg_brew_time,
  
  -- Pour technique distribution
  home_cafe_data->'recipe'->>'pourTechnique' as pour_technique,
  COUNT(*) as technique_count,
  
  -- Filter preferences
  home_cafe_data->'equipment'->>'filter' as filter_type,
  COUNT(*) as filter_count,
  
  -- Quality indicators
  COUNT(*) FILTER (WHERE (home_cafe_data->'notes'->>'channeling')::BOOLEAN = true) as channeling_occurrences,
  COUNT(*) FILTER (WHERE (home_cafe_data->'notes'->>'mudBed')::BOOLEAN = true) as mud_bed_occurrences,
  
  -- Time-based statistics
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as weekly_tastings
  
FROM tasting_records
WHERE mode = 'home_cafe' 
  AND is_deleted = FALSE
  AND home_cafe_data IS NOT NULL
GROUP BY 
  user_id, 
  dripper, 
  pour_technique, 
  filter_type,
  week;

-- Create a view for dripper comparison
CREATE OR REPLACE VIEW dripper_comparison AS
SELECT 
  home_cafe_data->'equipment'->>'dripper' as dripper,
  COUNT(*) as usage_count,
  AVG(match_score_total) as avg_score,
  AVG((sensory_attributes).acidity) as avg_acidity,
  AVG((sensory_attributes).sweetness) as avg_sweetness,
  AVG((sensory_attributes).body) as avg_body,
  AVG((sensory_attributes).finish) as avg_finish,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY match_score_total) as median_score,
  STRING_AGG(DISTINCT roastery, ', ') as roasters_used
FROM tasting_records
WHERE mode = 'home_cafe' 
  AND is_deleted = FALSE
  AND home_cafe_data IS NOT NULL
GROUP BY dripper
ORDER BY usage_count DESC;

-- Create a view for recipe optimization insights
CREATE OR REPLACE VIEW recipe_optimization AS
SELECT 
  user_id,
  coffee_name,
  roastery,
  home_cafe_data->'equipment'->>'dripper' as dripper,
  home_cafe_data->'recipe'->>'ratio' as ratio,
  (home_cafe_data->'recipe'->>'waterTemp')::NUMERIC as water_temp,
  (home_cafe_data->'recipe'->>'totalBrewTime')::NUMERIC as brew_time,
  match_score_total,
  home_cafe_data->'notes'->>'tasteResult' as taste_result,
  home_cafe_data->'notes'->>'nextExperiment' as next_experiment,
  created_at
FROM tasting_records
WHERE mode = 'home_cafe' 
  AND is_deleted = FALSE
  AND home_cafe_data IS NOT NULL
ORDER BY user_id, coffee_name, created_at DESC;

-- Grant permissions on new views
GRANT SELECT ON pourover_stats TO authenticated;
GRANT SELECT ON dripper_comparison TO authenticated;
GRANT SELECT ON recipe_optimization TO authenticated;

-- Create function to get optimal recipe for a coffee
CREATE OR REPLACE FUNCTION get_optimal_recipe(
  p_user_id UUID,
  p_coffee_name TEXT,
  p_roastery TEXT
) RETURNS TABLE (
  dripper TEXT,
  avg_score NUMERIC,
  best_ratio TEXT,
  best_water_temp NUMERIC,
  best_brew_time NUMERIC,
  recipe_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    home_cafe_data->'equipment'->>'dripper' as dripper,
    AVG(match_score_total) as avg_score,
    MODE() WITHIN GROUP (ORDER BY home_cafe_data->'recipe'->>'ratio') as best_ratio,
    AVG((home_cafe_data->'recipe'->>'waterTemp')::NUMERIC) as best_water_temp,
    AVG((home_cafe_data->'recipe'->>'totalBrewTime')::NUMERIC) as best_brew_time,
    COUNT(*)::INTEGER as recipe_count
  FROM tasting_records
  WHERE user_id = p_user_id
    AND coffee_name = p_coffee_name
    AND roastery = p_roastery
    AND mode = 'home_cafe'
    AND is_deleted = FALSE
    AND home_cafe_data IS NOT NULL
  GROUP BY dripper
  ORDER BY avg_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_optimal_recipe TO authenticated;