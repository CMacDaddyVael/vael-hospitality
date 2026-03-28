CREATE TABLE review_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  review_count INT DEFAULT 0,
  rating_1_count INT DEFAULT 0,
  rating_2_count INT DEFAULT 0,
  rating_3_count INT DEFAULT 0,
  rating_4_count INT DEFAULT 0,
  rating_5_count INT DEFAULT 0,
  avg_rating DECIMAL(3,2),
  positive_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,
  neutral_count INT DEFAULT 0,
  mixed_count INT DEFAULT 0,
  avg_sentiment_score DECIMAL(3,2),
  responded_count INT DEFAULT 0,
  avg_response_time_hours DECIMAL(8,2),
  auto_responded_count INT DEFAULT 0,
  topic_counts JSONB DEFAULT '{}',
  UNIQUE(property_id, date, platform)
);

CREATE INDEX idx_analytics_property_date ON review_analytics_daily(property_id, date DESC);

ALTER TABLE review_analytics_daily ENABLE ROW LEVEL SECURITY;
