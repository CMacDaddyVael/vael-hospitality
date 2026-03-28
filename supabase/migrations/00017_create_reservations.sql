CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pms_connection_id UUID REFERENCES pms_connections(id),
  pms_reservation_id TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_type TEXT,
  room_number TEXT,
  rate_amount DECIMAL(10,2),
  rate_currency TEXT DEFAULT 'USD',
  total_amount DECIMAL(10,2),
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  source TEXT,
  special_requests TEXT,
  upsell_campaign_sent_at TIMESTAMPTZ,
  upsell_revenue DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_reservations_pms_dedup
  ON reservations(property_id, pms_connection_id, pms_reservation_id)
  WHERE pms_reservation_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_reservations_guest ON reservations(guest_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservations_property_checkin ON reservations(property_id, check_in) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservations_property_status ON reservations(property_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservations_org ON reservations(organization_id) WHERE deleted_at IS NULL;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
