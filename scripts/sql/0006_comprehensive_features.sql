-- A/B Testing Tables
CREATE TABLE IF NOT EXISTS ab_test_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    variant VARCHAR(255) NOT NULL,
    event VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_test_events_test_id ON ab_test_events(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant ON ab_test_events(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_id ON ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_timestamp ON ab_test_events(timestamp);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'agent', 'bot')),
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'quick-action', 'file', 'image')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID,
    agent_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

-- Session Recordings Table
CREATE TABLE IF NOT EXISTS session_recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID,
    recording_url TEXT,
    recording_type VARCHAR(50) DEFAULT 'video' CHECK (recording_type IN ('video', 'audio', 'screen')),
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    quality VARCHAR(20) DEFAULT '720p' CHECK (quality IN ('480p', '720p', '1080p', '4k')),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add expires_at column separately
ALTER TABLE session_recordings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days');

CREATE INDEX IF NOT EXISTS idx_session_recordings_booking_id ON session_recordings(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_status ON session_recordings(status);
CREATE INDEX IF NOT EXISTS idx_session_recordings_expires_at ON session_recordings(expires_at);

-- Other tables
CREATE TABLE IF NOT EXISTS waiting_room_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID,
    patient_id UUID,
    therapist_id UUID,
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'in_session', 'completed', 'cancelled')),
    system_check_results JSONB DEFAULT '{}',
    connection_quality JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    session_started_at TIMESTAMPTZ,
    session_ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_waiting_room_booking_id ON waiting_room_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_waiting_room_patient_id ON waiting_room_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_waiting_room_status ON waiting_room_sessions(status);

-- Functions for cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_recordings()
RETURNS void AS $$
BEGIN
    UPDATE session_recordings 
    SET status = 'deleted' 
    WHERE expires_at < NOW() AND status != 'deleted';
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO ab_test_events (test_id, variant, event, user_id, session_id) VALUES
('hero-cta', 'control', 'impression', 'user_123', 'session_456'),
('hero-cta', 'variant-a', 'impression', 'user_124', 'session_457'),
('pricing-display', 'control', 'conversion', 'user_125', 'session_458')
ON CONFLICT DO NOTHING;

COMMIT;
