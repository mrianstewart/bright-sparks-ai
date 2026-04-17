-- Run this in Supabase SQL editor
-- Dashboard → SQL Editor → New query → paste → Run

CREATE TABLE speeches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),
  stripe_session_id VARCHAR(255),
  stripe_payment_status VARCHAR(50),
  tier VARCHAR(20) NOT NULL,

  speaker_role VARCHAR(50),
  couple_name_1 VARCHAR(100),
  couple_name_2 VARCHAR(100),
  relationship_description TEXT,
  stories JSONB,
  tone VARCHAR(50),
  target_length_minutes INTEGER,
  additional_notes TEXT,

  drafts JSONB,
  selected_draft INTEGER,
  edited_sections JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_at TIMESTAMPTZ,
  payment_completed_at TIMESTAMPTZ
);

CREATE TABLE speech_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speech_id UUID REFERENCES speeches(id),
  event_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER speeches_updated_at
  BEFORE UPDATE ON speeches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX speeches_access_token_idx ON speeches(access_token);
CREATE INDEX speeches_stripe_session_idx ON speeches(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX speech_events_speech_id_idx ON speech_events(speech_id);

ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_events ENABLE ROW LEVEL SECURITY;

-- API routes use service role key (bypasses RLS), deny all anon/authenticated direct access
CREATE POLICY "deny_anon_speeches" ON speeches FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_events" ON speech_events FOR ALL TO anon USING (false);
