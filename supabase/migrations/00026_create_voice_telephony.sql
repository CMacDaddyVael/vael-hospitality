-- Voice Configurations
CREATE TABLE voice_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  twilio_phone_number TEXT,
  twilio_phone_number_sid TEXT,
  forwarding_number TEXT,
  voice_id TEXT DEFAULT 'Polly.Joanna',
  tts_provider TEXT DEFAULT 'amazon',
  stt_provider TEXT DEFAULT 'google',
  primary_language TEXT DEFAULT 'en',
  supported_languages TEXT[] DEFAULT '{en}',
  auto_detect_language BOOLEAN DEFAULT true,
  greeting_message TEXT DEFAULT 'Thank you for calling. How may I assist you today?',
  after_hours_message TEXT,
  max_call_duration_seconds INTEGER DEFAULT 600,
  enable_call_recording BOOLEAN DEFAULT true,
  enable_transcription BOOLEAN DEFAULT true,
  transfer_departments JSONB DEFAULT '[]',
  operating_hours JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id)
);

CREATE INDEX idx_voice_config_phone ON voice_configurations(twilio_phone_number) WHERE twilio_phone_number IS NOT NULL;
ALTER TABLE voice_configurations ENABLE ROW LEVEL SECURITY;

-- Voice Knowledge Base
CREATE TABLE voice_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  structured_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_voice_kb_property ON voice_knowledge_base(property_id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_voice_kb_category ON voice_knowledge_base(property_id, category) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_voice_kb_tags ON voice_knowledge_base USING GIN(tags);
ALTER TABLE voice_knowledge_base ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED;
CREATE INDEX idx_voice_kb_fts ON voice_knowledge_base USING GIN(fts);
ALTER TABLE voice_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Voice Calls
CREATE TABLE voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  twilio_call_sid TEXT UNIQUE NOT NULL,
  twilio_recording_sid TEXT,
  twilio_recording_url TEXT,
  caller_phone TEXT,
  caller_name TEXT,
  guest_id UUID REFERENCES guests(id),
  direction TEXT DEFAULT 'inbound',
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  detected_language TEXT,
  topics TEXT[] DEFAULT '{}',
  summary TEXT,
  sentiment TEXT,
  resolution TEXT,
  transferred_to TEXT,
  actions_taken JSONB DEFAULT '[]',
  cost_stt DECIMAL(8,4) DEFAULT 0,
  cost_llm DECIMAL(8,4) DEFAULT 0,
  cost_tts DECIMAL(8,4) DEFAULT 0,
  cost_telephony DECIMAL(8,4) DEFAULT 0,
  cost_total DECIMAL(8,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_calls_property_date ON voice_calls(property_id, started_at DESC);
CREATE INDEX idx_voice_calls_twilio ON voice_calls(twilio_call_sid);
CREATE INDEX idx_voice_calls_topics ON voice_calls USING GIN(topics);
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

-- Voice Call Messages (transcript)
CREATE TABLE voice_call_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  confidence DECIMAL(3,2),
  language TEXT,
  duration_ms INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_messages_call ON voice_call_messages(call_id);
ALTER TABLE voice_call_messages ENABLE ROW LEVEL SECURITY;

-- Voice Analytics Daily
CREATE TABLE voice_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  transferred_calls INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  resolved_count INTEGER DEFAULT 0,
  unresolved_count INTEGER DEFAULT 0,
  topic_counts JSONB DEFAULT '{}',
  language_counts JSONB DEFAULT '{}',
  resolution_counts JSONB DEFAULT '{}',
  sentiment_counts JSONB DEFAULT '{}',
  total_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, date)
);

CREATE INDEX idx_voice_analytics_daily ON voice_analytics_daily(property_id, date DESC);
ALTER TABLE voice_analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'voice_configurations', 'voice_knowledge_base', 'voice_calls', 'voice_analytics_daily'
  ] LOOP
    EXECUTE format('CREATE POLICY "%1$s_select" ON %1$s FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()))', tbl);
    EXECUTE format('CREATE POLICY "%1$s_insert" ON %1$s FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_write_org_ids()))', tbl);
    EXECUTE format('CREATE POLICY "%1$s_update" ON %1$s FOR UPDATE USING (organization_id IN (SELECT get_user_write_org_ids()))', tbl);
  END LOOP;
END $$;

CREATE POLICY "voice_call_messages_select" ON voice_call_messages FOR SELECT
  USING (call_id IN (SELECT id FROM voice_calls WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "voice_call_messages_insert" ON voice_call_messages FOR INSERT
  WITH CHECK (call_id IN (SELECT id FROM voice_calls WHERE organization_id IN (SELECT get_user_write_org_ids())));

-- Triggers
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'voice_configurations', 'voice_knowledge_base', 'voice_calls', 'voice_analytics_daily'
  ] LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl);
  END LOOP;
END $$;
