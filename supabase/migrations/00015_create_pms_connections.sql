CREATE TABLE pms_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  credentials JSONB NOT NULL DEFAULT '{}',
  webhook_secret TEXT,
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,
  last_sync_error_at TIMESTAMPTZ,
  sync_cursor JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_pms_connections_property_provider
  ON pms_connections(property_id, provider) WHERE deleted_at IS NULL;
CREATE INDEX idx_pms_connections_org ON pms_connections(organization_id) WHERE deleted_at IS NULL;
ALTER TABLE pms_connections ENABLE ROW LEVEL SECURITY;
