-- db/migrations/001_create_reports_table.sql

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  report_code VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL,
  stop_id VARCHAR(50) NOT NULL,
  stop_name VARCHAR(100) NOT NULL,
  issue_type VARCHAR(100) NOT NULL,
  description TEXT,
  photo_url TEXT,
  status VARCHAR(20) NOT NULL,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  empathy_count INTEGER DEFAULT 0,
  is_urgent BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
