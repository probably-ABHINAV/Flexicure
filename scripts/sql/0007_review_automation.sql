-- Review automation and analytics tables
CREATE TABLE IF NOT EXISTS review_request_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_ids UUID[] NOT NULL,
    emails_sent INTEGER NOT NULL DEFAULT 0,
    total_eligible INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B testing tables
CREATE TABLE IF NOT EXISTS ab_test_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    variant VARCHAR(255) NOT NULL,
    event VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    page_url TEXT NOT NULL,
    cls DECIMAL(10,4),
    fid DECIMAL(10,2),
    fcp DECIMAL(10,2),
    lcp DECIMAL(10,2),
    ttfb DECIMAL(10,2),
    user_agent TEXT,
    connection_type VARCHAR(50),
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_request_log_created_at ON review_request_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_test_id ON ab_test_events(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_id ON ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created_at ON ab_test_events(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_request_log_updated_at 
    BEFORE UPDATE ON review_request_log 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE review_request_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin can manage review request log" ON review_request_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Allow insert ab test events" ON ab_test_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view ab test events" ON ab_test_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Allow insert performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );
