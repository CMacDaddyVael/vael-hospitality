CREATE TABLE upsell_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sends_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  acceptances_count INTEGER DEFAULT 0,
  gross_revenue DECIMAL(10,2) DEFAULT 0,
  commission_revenue DECIMAL(10,2) DEFAULT 0,
  revenue_by_category JSONB DEFAULT '{}',
  sends_by_category JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_upsell_analytics_daily_unique ON upsell_analytics_daily(property_id, date);
CREATE INDEX idx_upsell_analytics_org ON upsell_analytics_daily(organization_id, date DESC);
ALTER TABLE upsell_analytics_daily ENABLE ROW LEVEL SECURITY;
