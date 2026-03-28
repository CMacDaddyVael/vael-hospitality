CREATE TABLE guest_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  ai_model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guest_messages_guest ON guest_messages(guest_id);
CREATE INDEX idx_guest_messages_property ON guest_messages(property_id, created_at DESC);
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
