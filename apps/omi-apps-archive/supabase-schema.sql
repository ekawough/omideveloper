-- ============================================================
-- Omi Connect Tesla — Supabase Schema
-- Run in Supabase SQL Editor before deploying
-- ============================================================

CREATE TABLE IF NOT EXISTS tesla_sessions (
  uid TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  vin TEXT NOT NULL,
  vehicle_name TEXT DEFAULT 'My Tesla',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid TEXT NOT NULL,
  command TEXT NOT NULL,
  trigger_text TEXT,
  success BOOLEAN DEFAULT true,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_command_log_uid ON command_log(uid);
CREATE INDEX IF NOT EXISTS idx_command_log_created ON command_log(created_at DESC);

ALTER TABLE tesla_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_sessions" ON tesla_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_logs" ON command_log FOR ALL USING (true) WITH CHECK (true);
