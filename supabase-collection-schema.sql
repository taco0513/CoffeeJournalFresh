-- 개발자/운영자용 데이터 수집 테이블 스키마
-- 사용자의 로컬 Realm 데이터를 수집하기 위한 테이블

-- 수집된 테이스팅 데이터 테이블
CREATE TABLE IF NOT EXISTS collected_tastings (
  -- 기본 정보
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  
  -- 커피 정보
  coffee_name TEXT NOT NULL,
  roastery TEXT NOT NULL,
  cafe_name TEXT,
  origin TEXT,
  variety TEXT,
  process TEXT,
  roaster_notes TEXT,
  
  -- 테이스팅 정보
  temperature TEXT,
  match_score_total INTEGER,
  
  -- 감각 평가
  sensory_body INTEGER,
  sensory_acidity INTEGER,
  sensory_sweetness INTEGER,
  sensory_finish INTEGER,
  
  -- 플레이버 노트 (JSON 배열)
  flavor_notes JSONB,
  
  -- 메타데이터
  is_deleted BOOLEAN DEFAULT FALSE,
  device_info JSONB,
  
  -- 수집 관련 정보
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  collection_version TEXT DEFAULT '1.0'
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_collected_tastings_user_id ON collected_tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_collected_tastings_created_at ON collected_tastings(created_at);
CREATE INDEX IF NOT EXISTS idx_collected_tastings_collected_at ON collected_tastings(collected_at);
CREATE INDEX IF NOT EXISTS idx_collected_tastings_roastery ON collected_tastings(roastery);
CREATE INDEX IF NOT EXISTS idx_collected_tastings_origin ON collected_tastings(origin);

-- 플레이버 노트 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_collected_tastings_flavor_notes ON collected_tastings USING GIN (flavor_notes);

-- 데이터 수집 통계를 위한 뷰
CREATE OR REPLACE VIEW collection_stats AS
SELECT 
  DATE_TRUNC('day', collected_at) as collection_date,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT roastery) as unique_roasteries,
  COUNT(DISTINCT origin) as unique_origins,
  AVG(match_score_total) as avg_match_score,
  AVG(sensory_body) as avg_body,
  AVG(sensory_acidity) as avg_acidity,
  AVG(sensory_sweetness) as avg_sweetness,
  AVG(sensory_finish) as avg_finish
FROM collected_tastings
WHERE is_deleted = FALSE
GROUP BY DATE_TRUNC('day', collected_at)
ORDER BY collection_date DESC;

-- 로스터리별 통계 뷰
CREATE OR REPLACE VIEW roastery_stats AS
SELECT 
  roastery,
  COUNT(*) as total_tastings,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(match_score_total) as avg_match_score,
  AVG(sensory_body) as avg_body,
  AVG(sensory_acidity) as avg_acidity,
  AVG(sensory_sweetness) as avg_sweetness,
  AVG(sensory_finish) as avg_finish,
  MIN(created_at) as first_tasting,
  MAX(created_at) as last_tasting
FROM collected_tastings
WHERE is_deleted = FALSE
GROUP BY roastery
ORDER BY total_tastings DESC;

-- 원산지별 통계 뷰
CREATE OR REPLACE VIEW origin_stats AS
SELECT 
  origin,
  COUNT(*) as total_tastings,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT roastery) as unique_roasteries,
  AVG(match_score_total) as avg_match_score,
  AVG(sensory_body) as avg_body,
  AVG(sensory_acidity) as avg_acidity,
  AVG(sensory_sweetness) as avg_sweetness,
  AVG(sensory_finish) as avg_finish
FROM collected_tastings
WHERE is_deleted = FALSE AND origin IS NOT NULL
GROUP BY origin
ORDER BY total_tastings DESC;

-- 플레이버 노트 분석을 위한 뷰
CREATE OR REPLACE VIEW flavor_analysis AS
SELECT 
  flavor_note->>'level' as flavor_level,
  flavor_note->>'value' as flavor_value,
  COUNT(*) as frequency,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(match_score_total) as avg_match_score
FROM collected_tastings,
     jsonb_array_elements(flavor_notes) as flavor_note
WHERE is_deleted = FALSE
GROUP BY flavor_note->>'level', flavor_note->>'value'
ORDER BY frequency DESC;

-- 데이터 수집 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS collection_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  collection_type TEXT NOT NULL, -- 'full', 'partial', 'date_range'
  total_records INTEGER DEFAULT 0,
  uploaded_records INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  collection_started_at TIMESTAMPTZ DEFAULT NOW(),
  collection_completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- 수집 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_collection_logs_user_id ON collection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_logs_started_at ON collection_logs(collection_started_at);
CREATE INDEX IF NOT EXISTS idx_collection_logs_success ON collection_logs(success);

-- RLS (Row Level Security) 정책 (필요시 활성화)
-- ALTER TABLE collected_tastings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;

-- 개발자/운영자만 접근 가능한 정책 예시
-- CREATE POLICY "Only admins can access collected data" ON collected_tastings
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 통계 조회 함수
CREATE OR REPLACE FUNCTION get_collection_summary()
RETURNS TABLE (
  total_records BIGINT,
  unique_users BIGINT,
  unique_roasteries BIGINT,
  unique_origins BIGINT,
  avg_match_score NUMERIC,
  latest_collection TIMESTAMPTZ,
  earliest_collection TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT roastery) as unique_roasteries,
    COUNT(DISTINCT origin) as unique_origins,
    AVG(match_score_total) as avg_match_score,
    MAX(collected_at) as latest_collection,
    MIN(collected_at) as earliest_collection
  FROM collected_tastings
  WHERE is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 사용 예시:
-- SELECT * FROM get_collection_summary();
-- SELECT * FROM collection_stats LIMIT 10;
-- SELECT * FROM roastery_stats LIMIT 10;
-- SELECT * FROM origin_stats LIMIT 10;
-- SELECT * FROM flavor_analysis WHERE flavor_level = '1' LIMIT 10;