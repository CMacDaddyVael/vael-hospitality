CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_generated_text TEXT,
  edited_text TEXT,
  published_text TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  model_used TEXT,
  generation_time_ms INT,
  brand_voice_id UUID REFERENCES brand_voices(id),
  snippets_used UUID[],
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  platform_response_id TEXT,
  publish_error TEXT,
  publish_attempts INT DEFAULT 0,
  was_auto_generated BOOLEAN DEFAULT false,
  was_auto_published BOOLEAN DEFAULT false,
  automation_rule_id UUID,
  version INT DEFAULT 1,
  previous_version_id UUID REFERENCES review_responses(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_responses_review ON review_responses(review_id);
CREATE INDEX idx_responses_property_status ON review_responses(property_id, status);

ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
