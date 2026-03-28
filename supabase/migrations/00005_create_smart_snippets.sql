CREATE TABLE smart_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  topic_keywords TEXT[] NOT NULL,
  sentiment TEXT NOT NULL DEFAULT 'any',
  talking_points TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_snippets_property ON smart_snippets(property_id) WHERE is_active = true;
CREATE INDEX idx_snippets_keywords ON smart_snippets USING GIN(topic_keywords);

ALTER TABLE smart_snippets ENABLE ROW LEVEL SECURITY;
