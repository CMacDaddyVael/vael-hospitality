CREATE TABLE review_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  connection_type TEXT,
  oauth_access_token TEXT,
  oauth_refresh_token TEXT,
  oauth_token_expires_at TIMESTAMPTZ,
  oauth_scopes TEXT[],
  scrape_url TEXT,
  last_scrape_at TIMESTAMPTZ,
  scrape_frequency_minutes INT DEFAULT 360,
  last_sync_at TIMESTAMPTZ,
  last_sync_review_count INT,
  sync_error TEXT,
  sync_error_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_review_sources_unique ON review_sources(property_id, platform)
  WHERE is_connected = true;

ALTER TABLE review_sources ENABLE ROW LEVEL SECURITY;
