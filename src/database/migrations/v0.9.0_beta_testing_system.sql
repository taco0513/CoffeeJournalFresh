-- Migration v0.9.0: Beta Testing System
-- Adds comprehensive beta testing infrastructure for dual-market launch
-- Korean primary market + US beta market support

-- Beta Users Table
CREATE TABLE IF NOT EXISTS beta_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('korean', 'us_beta')),
    language TEXT NOT NULL CHECK (language IN ('ko', 'en')),
    testing_level TEXT NOT NULL DEFAULT 'basic' CHECK (testing_level IN ('basic', 'advanced', 'power_user')),
    device_info JSONB NOT NULL,
    preferences JSONB NOT NULL,
    feedback_count INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Beta Feedback Table
CREATE TABLE IF NOT EXISTS beta_feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'improvement', 'general')),
    category TEXT NOT NULL CHECK (category IN ('ui_ux', 'performance', 'features', 'content', 'technical')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reproduction_steps TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    screenshots TEXT[],
    device_info JSONB NOT NULL,
    market_context TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deployment Status Table
CREATE TABLE IF NOT EXISTS deployment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    build_number TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
    release_date TIMESTAMP WITH TIME ZONE NOT NULL,
    market_rollout JSONB NOT NULL,
    issues JSONB NOT NULL DEFAULT '[]',
    metrics JSONB NOT NULL DEFAULT '{}',
    rollout_stage TEXT NOT NULL DEFAULT 'canary' CHECK (rollout_stage IN ('canary', 'early_rollout', 'full_rollout')),
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deployment Issues Table
CREATE TABLE IF NOT EXISTS deployment_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID REFERENCES deployment_status(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('crash', 'performance', 'network', 'ui')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    stack_trace TEXT,
    reproduction_steps TEXT,
    affected_users_count INTEGER NOT NULL DEFAULT 0,
    market TEXT NOT NULL CHECK (market IN ('korean', 'us_beta', 'both')),
    user_id TEXT,
    device_info JSONB,
    status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'fixing', 'resolved')),
    resolution_notes TEXT,
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    market TEXT CHECK (market IN ('korean', 'us_beta')),
    session_id TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    device_info JSONB,
    app_version TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Beta Feature Flags Table
CREATE TABLE IF NOT EXISTS beta_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name TEXT NOT NULL UNIQUE,
    flag_description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    market_filter TEXT CHECK (market_filter IN ('korean', 'us_beta', 'both')),
    user_percentage INTEGER NOT NULL DEFAULT 0 CHECK (user_percentage >= 0 AND user_percentage <= 100),
    conditions JSONB DEFAULT '{}',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Rollout Status Table
CREATE TABLE IF NOT EXISTS user_rollout_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('korean', 'us_beta')),
    version TEXT NOT NULL,
    rollout_group TEXT NOT NULL,
    rollout_percentage INTEGER NOT NULL,
    is_enrolled BOOLEAN NOT NULL DEFAULT false,
    enrolled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, version)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_users_market ON beta_users(market);
CREATE INDEX IF NOT EXISTS idx_beta_users_email ON beta_users(email);
CREATE INDEX IF NOT EXISTS idx_beta_users_user_id ON beta_users(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_users_active ON beta_users(last_active_at);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_severity ON beta_feedback(severity);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created ON beta_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_deployment_status_version ON deployment_status(version);
CREATE INDEX IF NOT EXISTS idx_deployment_status_active ON deployment_status(is_active);
CREATE INDEX IF NOT EXISTS idx_deployment_status_environment ON deployment_status(environment);

CREATE INDEX IF NOT EXISTS idx_deployment_issues_deployment ON deployment_issues(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_issues_severity ON deployment_issues(severity);
CREATE INDEX IF NOT EXISTS idx_deployment_issues_status ON deployment_issues(status);
CREATE INDEX IF NOT EXISTS idx_deployment_issues_market ON deployment_issues(market);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_market ON performance_metrics(market);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_beta_feature_flags_name ON beta_feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_beta_feature_flags_enabled ON beta_feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_beta_feature_flags_market ON beta_feature_flags(market_filter);

CREATE INDEX IF NOT EXISTS idx_user_rollout_status_user ON user_rollout_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rollout_status_version ON user_rollout_status(version);
CREATE INDEX IF NOT EXISTS idx_user_rollout_status_enrolled ON user_rollout_status(is_enrolled);

-- Create views for analytics and reporting

-- Beta User Statistics View
CREATE OR REPLACE VIEW beta_user_stats AS
SELECT 
    market,
    language,
    testing_level,
    COUNT(*) as user_count,
    AVG(feedback_count) as avg_feedback_count,
    COUNT(CASE WHEN last_active_at > now() - interval '7 days' THEN 1 END) as active_7d,
    COUNT(CASE WHEN last_active_at > now() - interval '1 day' THEN 1 END) as active_1d
FROM beta_users
GROUP BY market, language, testing_level;

-- Feedback Analytics View
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
    bf.type,
    bf.category,
    bf.severity,
    bu.market,
    COUNT(*) as feedback_count,
    COUNT(CASE WHEN bf.status = 'resolved' THEN 1 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (bf.resolved_at - bf.created_at))/3600) as avg_resolution_hours,
    COUNT(CASE WHEN bf.created_at > now() - interval '7 days' THEN 1 END) as recent_count
FROM beta_feedback bf
LEFT JOIN beta_users bu ON bf.user_id = bu.user_id
GROUP BY bf.type, bf.category, bf.severity, bu.market;

-- Deployment Health View
CREATE OR REPLACE VIEW deployment_health AS
SELECT 
    ds.version,
    ds.environment,
    ds.rollout_stage,
    ds.rollout_percentage,
    COUNT(di.id) as total_issues,
    COUNT(CASE WHEN di.severity = 'critical' THEN 1 END) as critical_issues,
    COUNT(CASE WHEN di.severity = 'high' THEN 1 END) as high_issues,
    COUNT(CASE WHEN di.status = 'resolved' THEN 1 END) as resolved_issues,
    ds.metrics->>'crashRate' as crash_rate,
    ds.metrics->>'errorRate' as error_rate,
    ds.metrics->>'averageLoadTime' as avg_load_time
FROM deployment_status ds
LEFT JOIN deployment_issues di ON ds.id = di.deployment_id
WHERE ds.is_active = true
GROUP BY ds.id, ds.version, ds.environment, ds.rollout_stage, ds.rollout_percentage, ds.metrics;

-- Performance Summary View
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    market,
    metric_type,
    metric_name,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value,
    COUNT(*) as sample_count,
    COUNT(DISTINCT user_id) as unique_users
FROM performance_metrics
WHERE timestamp > now() - interval '24 hours'
GROUP BY market, metric_type, metric_name;

-- Market Comparison View
CREATE OR REPLACE VIEW market_comparison AS
SELECT 
    'korean' as market,
    COUNT(DISTINCT bu.user_id) as total_users,
    COUNT(DISTINCT CASE WHEN bu.last_active_at > now() - interval '7 days' THEN bu.user_id END) as active_users_7d,
    AVG(bu.feedback_count) as avg_feedback_per_user,
    COUNT(bf.id) as total_feedback,
    COUNT(CASE WHEN bf.severity IN ('high', 'critical') THEN 1 END) as high_severity_feedback,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'app_launch_time') as avg_launch_time,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'search_response_time') as avg_search_time
FROM beta_users bu
LEFT JOIN beta_feedback bf ON bu.user_id = bf.user_id
LEFT JOIN performance_metrics pm ON bu.user_id = pm.user_id AND pm.timestamp > now() - interval '24 hours'
WHERE bu.market = 'korean'

UNION ALL

SELECT 
    'us_beta' as market,
    COUNT(DISTINCT bu.user_id) as total_users,
    COUNT(DISTINCT CASE WHEN bu.last_active_at > now() - interval '7 days' THEN bu.user_id END) as active_users_7d,
    AVG(bu.feedback_count) as avg_feedback_per_user,
    COUNT(bf.id) as total_feedback,
    COUNT(CASE WHEN bf.severity IN ('high', 'critical') THEN 1 END) as high_severity_feedback,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'app_launch_time') as avg_launch_time,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'search_response_time') as avg_search_time
FROM beta_users bu
LEFT JOIN beta_feedback bf ON bu.user_id = bf.user_id
LEFT JOIN performance_metrics pm ON bu.user_id = pm.user_id AND pm.timestamp > now() - interval '24 hours'
WHERE bu.market = 'us_beta';

-- Insert default feature flags
INSERT INTO beta_feature_flags (flag_name, flag_description, is_enabled, market_filter, user_percentage) VALUES
('home_cafe_mode', 'Home Cafe Mode with pourover brewing tracking', true, 'both', 100),
('lab_mode', 'Professional Lab Mode for detailed analysis', true, 'korean', 100),
('market_intelligence', 'Real-time coffee market data via Firecrawl', true, 'both', 100),
('achievements', 'Achievement system and gamification', true, 'both', 100),
('performance_dashboard', 'Developer performance monitoring dashboard', true, 'both', 100),
('beta_testing_dashboard', 'Beta testing and feedback collection dashboard', true, 'us_beta', 100),
('advanced_analytics', 'Advanced analytics and reporting features', false, 'both', 0),
('social_features', 'Social sharing and community features', false, 'both', 0),
('ai_coaching', 'AI-powered coffee coaching system', false, 'both', 0),
('photo_ocr', 'Photo OCR for coffee bag scanning', false, 'both', 0)
ON CONFLICT (flag_name) DO NOTHING;

-- Insert initial deployment status
INSERT INTO deployment_status (
    version, 
    build_number, 
    environment, 
    release_date, 
    market_rollout, 
    metrics, 
    rollout_stage, 
    rollout_percentage, 
    is_active
) VALUES (
    '1.0.0-beta',
    '1',
    'production',
    now(),
    '{
        "korean": {
            "status": "complete",
            "percentage": 100,
            "userCount": 0
        },
        "us_beta": {
            "status": "complete", 
            "percentage": 100,
            "userCount": 0
        }
    }',
    '{
        "crashRate": 0.001,
        "averageSessionLength": 300,
        "userRetention24h": 0.85,
        "userRetention7d": 0.65,
        "averageLoadTime": 1200,
        "apiErrorRate": 0.02,
        "feedbackScore": 4.2
    }',
    'full_rollout',
    100,
    true
) ON CONFLICT DO NOTHING;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_beta_users_updated_at ON beta_users;
CREATE TRIGGER update_beta_users_updated_at 
    BEFORE UPDATE ON beta_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beta_feedback_updated_at ON beta_feedback;
CREATE TRIGGER update_beta_feedback_updated_at 
    BEFORE UPDATE ON beta_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deployment_status_updated_at ON deployment_status;
CREATE TRIGGER update_deployment_status_updated_at 
    BEFORE UPDATE ON deployment_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deployment_issues_updated_at ON deployment_issues;
CREATE TRIGGER update_deployment_issues_updated_at 
    BEFORE UPDATE ON deployment_issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beta_feature_flags_updated_at ON beta_feature_flags;
CREATE TRIGGER update_beta_feature_flags_updated_at 
    BEFORE UPDATE ON beta_feature_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_rollout_status_updated_at ON user_rollout_status;
CREATE TRIGGER update_user_rollout_status_updated_at 
    BEFORE UPDATE ON user_rollout_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rollout_status ENABLE ROW LEVEL SECURITY;

-- Beta users can only see their own data
CREATE POLICY "Users can view their own beta data" ON beta_users
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own beta data" ON beta_users
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Beta feedback policies
CREATE POLICY "Users can view their own feedback" ON beta_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own feedback" ON beta_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Performance metrics policies
CREATE POLICY "Users can view their own metrics" ON performance_metrics
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own metrics" ON performance_metrics
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Public read access for deployment status and feature flags
CREATE POLICY "Anyone can view deployment status" ON deployment_status
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view feature flags" ON beta_feature_flags
    FOR SELECT USING (true);

-- Admin policies (would be configured with specific admin roles)
-- CREATE POLICY "Admins can manage all data" ON beta_users FOR ALL USING (is_admin());
-- CREATE POLICY "Admins can manage all feedback" ON beta_feedback FOR ALL USING (is_admin());

-- Comments for documentation
COMMENT ON TABLE beta_users IS 'Beta testing user management and preferences';
COMMENT ON TABLE beta_feedback IS 'User feedback and bug reports for beta testing';
COMMENT ON TABLE deployment_status IS 'Deployment rollout status and health metrics';
COMMENT ON TABLE deployment_issues IS 'Issues and problems identified during deployment';
COMMENT ON TABLE performance_metrics IS 'App performance metrics and monitoring data';
COMMENT ON TABLE beta_feature_flags IS 'Feature flag configuration for beta testing';
COMMENT ON TABLE user_rollout_status IS 'User enrollment in rollout groups and versions';

COMMENT ON VIEW beta_user_stats IS 'Aggregated statistics about beta users by market and language';
COMMENT ON VIEW feedback_analytics IS 'Analytics and trends for beta feedback data';
COMMENT ON VIEW deployment_health IS 'Current deployment health and issue summary';
COMMENT ON VIEW performance_summary IS 'Performance metrics summary with percentiles';
COMMENT ON VIEW market_comparison IS 'Side-by-side comparison of Korean vs US Beta markets';