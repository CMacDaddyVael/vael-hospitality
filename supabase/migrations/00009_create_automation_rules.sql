CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  conditions JSONB NOT NULL,
  action TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  times_triggered INT DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_automation_property ON automation_rules(property_id) WHERE is_active = true;

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE review_responses
  ADD CONSTRAINT fk_automation_rule
  FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id);
