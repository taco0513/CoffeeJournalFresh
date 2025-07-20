-- Analytics and Performance Monitoring Tables
-- Version: 0.6.0
-- Date: 2025-07-20

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('screen_view', 'button_click', 'feature_use', 'error', 'timing')),
  event_name TEXT NOT NULL,
  screen_name TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('crash', 'error', 'performance', 'memory', 'network')),
  event_name TEXT NOT NULL,
  value NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Sessions Table (for aggregated session data)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL UNIQUE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_ms INTEGER,
  screen_views INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  crash_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  device_info JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_screen_name ON analytics_events(screen_name);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Performance Metrics Policies
CREATE POLICY "Users can insert their own performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all performance metrics" ON performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- User Sessions Policies
CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all user sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Create views for analytics dashboards
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE event_type = 'screen_view') as screen_views,
  COUNT(*) FILTER (WHERE event_type = 'button_click') as button_clicks,
  COUNT(*) FILTER (WHERE event_type = 'feature_use') as feature_uses,
  COUNT(*) FILTER (WHERE event_type = 'error') as errors
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

CREATE OR REPLACE VIEW performance_dashboard AS
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) FILTER (WHERE metric_type = 'crash') as crashes,
  COUNT(*) FILTER (WHERE metric_type = 'error') as errors,
  AVG(value) FILTER (WHERE metric_type = 'performance' AND event_name LIKE '%_duration') as avg_performance_ms,
  AVG(value) FILTER (WHERE metric_type = 'network') as avg_network_ms,
  COUNT(*) FILTER (WHERE metric_type = 'memory') as memory_warnings
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Triggers for updating user_sessions
CREATE OR REPLACE FUNCTION update_user_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session stats when analytics events are inserted
  IF TG_TABLE_NAME = 'analytics_events' THEN
    UPDATE user_sessions
    SET 
      event_count = event_count + 1,
      screen_views = screen_views + CASE WHEN NEW.event_type = 'screen_view' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE session_id = NEW.session_id;
    
    -- Insert session if it doesn't exist (for guest users)
    INSERT INTO user_sessions (id, user_id, session_id, start_time, device_info)
    SELECT 
      NEW.session_id,
      NEW.user_id,
      NEW.session_id,
      NEW.timestamp,
      NEW.device_info
    WHERE NOT EXISTS (
      SELECT 1 FROM user_sessions WHERE session_id = NEW.session_id
    );
  END IF;
  
  -- Update session stats when performance metrics are inserted
  IF TG_TABLE_NAME = 'performance_metrics' THEN
    UPDATE user_sessions
    SET 
      crash_count = crash_count + CASE WHEN NEW.metric_type = 'crash' THEN 1 ELSE 0 END,
      error_count = error_count + CASE WHEN NEW.metric_type = 'error' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE session_id = NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_session_from_analytics ON analytics_events;
CREATE TRIGGER trigger_update_session_from_analytics
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_session_stats();

DROP TRIGGER IF EXISTS trigger_update_session_from_performance ON performance_metrics;
CREATE TRIGGER trigger_update_session_from_performance
  AFTER INSERT ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_session_stats();

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(DISTINCT session_id),
    'total_events', COUNT(*),
    'avg_session_duration', AVG(
      CASE 
        WHEN s.duration_ms IS NOT NULL THEN s.duration_ms 
        ELSE NULL 
      END
    ),
    'most_used_screens', (
      SELECT json_agg(json_build_object('screen', screen_name, 'count', cnt))
      FROM (
        SELECT screen_name, COUNT(*) as cnt
        FROM analytics_events
        WHERE user_id = target_user_id AND event_type = 'screen_view'
        GROUP BY screen_name
        ORDER BY cnt DESC
        LIMIT 5
      ) top_screens
    ),
    'error_rate', COALESCE(
      (COUNT(*) FILTER (WHERE event_type = 'error')::FLOAT / NULLIF(COUNT(*), 0)) * 100,
      0
    )
  ) INTO result
  FROM analytics_events a
  LEFT JOIN user_sessions s ON a.session_id = s.session_id
  WHERE a.user_id = target_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT SELECT, INSERT ON performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
GRANT SELECT ON analytics_dashboard TO authenticated;
GRANT SELECT ON performance_dashboard TO authenticated;