CREATE TABLE brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  tone TEXT NOT NULL DEFAULT 'professional_friendly',
  language TEXT DEFAULT 'en',
  response_length TEXT DEFAULT 'medium',
  greeting_style TEXT DEFAULT 'dear_guest',
  sign_off TEXT DEFAULT 'Warm regards,\nThe Team',
  always_include TEXT[],
  never_include TEXT[],
  property_facts JSONB DEFAULT '[]',
  custom_instructions TEXT,
  example_responses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brand_voices_property ON brand_voices(property_id) WHERE is_active = true;

ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
