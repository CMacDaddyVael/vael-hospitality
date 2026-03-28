CREATE TABLE upsell_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_currency TEXT DEFAULT 'USD',
  price_type TEXT DEFAULT 'fixed',
  target_segments TEXT[] DEFAULT '{}',
  target_min_stay_nights INTEGER,
  target_min_rate DECIMAL(10,2),
  target_room_types TEXT[] DEFAULT '{}',
  target_booking_sources TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_upsell_offers_property ON upsell_offers(property_id) WHERE deleted_at IS NULL AND is_active = true;
ALTER TABLE upsell_offers ENABLE ROW LEVEL SECURITY;
