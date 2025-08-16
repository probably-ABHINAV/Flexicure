-- Web Vitals monitoring table
CREATE TABLE IF NOT EXISTS web_vitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(10) NOT NULL, -- LCP, FID, CLS, FCP, TTFB
  value DECIMAL(10,2) NOT NULL,
  rating VARCHAR(20) NOT NULL, -- good, needs-improvement, poor
  delta DECIMAL(10,2) NOT NULL,
  metric_id VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_name_timestamp ON web_vitals(name, timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals(rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_url ON web_vitals(url);

-- Performance insights view
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT 
  name,
  COUNT(*) as total_measurements,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  COUNT(CASE WHEN rating = 'good' THEN 1 END) * 100.0 / COUNT(*) as good_percentage,
  COUNT(CASE WHEN rating = 'needs-improvement' THEN 1 END) * 100.0 / COUNT(*) as needs_improvement_percentage,
  COUNT(CASE WHEN rating = 'poor' THEN 1 END) * 100.0 / COUNT(*) as poor_percentage
FROM web_vitals 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY name;
