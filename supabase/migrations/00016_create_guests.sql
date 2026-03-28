CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  language TEXT DEFAULT 'en',
  pms_guest_id TEXT,
  pms_connection_id UUID REFERENCES pms_connections(id),
  matched_reviewer_names TEXT[] DEFAULT '{}',
  segment TEXT,
  segment_confidence DECIMAL(3,2),
  preferences JSONB DEFAULT '{}',
  ai_summary TEXT,
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  total_stays INTEGER DEFAULT 0,
  total_spend DECIMAL(10,2) DEFAULT 0,
  avg_rating DECIMAL(3,2),
  last_stay_at TIMESTAMPTZ,
  first_stay_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_guests_pms_dedup
  ON guests(property_id, pms_connection_id, pms_guest_id)
  WHERE pms_guest_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_guests_property ON guests(property_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_guests_org ON guests(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_guests_email ON guests(property_id, email) WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_guests_segment ON guests(property_id, segment) WHERE deleted_at IS NULL;
CREATE INDEX idx_guests_tags ON guests USING GIN(tags);

ALTER TABLE guests ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, ''))) STORED;
CREATE INDEX idx_guests_fts ON guests USING GIN(fts);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
