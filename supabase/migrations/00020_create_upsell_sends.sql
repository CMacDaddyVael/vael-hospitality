CREATE TABLE upsell_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  offer_ids UUID[] NOT NULL,
  personalization_context JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  accepted_offer_ids UUID[] DEFAULT '{}',
  total_revenue DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_upsell_sends_reservation ON upsell_sends(reservation_id);
CREATE INDEX idx_upsell_sends_guest ON upsell_sends(guest_id);
CREATE INDEX idx_upsell_sends_property_date ON upsell_sends(property_id, created_at DESC);
CREATE INDEX idx_upsell_sends_status ON upsell_sends(property_id, status);
ALTER TABLE upsell_sends ENABLE ROW LEVEL SECURITY;
