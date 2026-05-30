-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS audio_vault_tokens (
  uid         TEXT PRIMARY KEY,
  tokens      JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_vault_summary (
  uid            TEXT,
  date           DATE,
  total_secs     INTEGER DEFAULT 0,
  clips          INTEGER DEFAULT 0,
  last_drive_url TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (uid, date)
);
