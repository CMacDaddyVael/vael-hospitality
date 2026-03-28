CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  star_rating SMALLINT,
  property_type TEXT DEFAULT 'hotel',
  timezone TEXT DEFAULT 'UTC',
  google_place_id TEXT,
  google_business_account_id TEXT,
  google_location_name TEXT,
  booking_com_url TEXT,
  tripadvisor_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_properties_org ON properties(organization_id) WHERE deleted_at IS NULL;

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
