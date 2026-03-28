CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  review_source_id UUID REFERENCES review_sources(id),
  platform TEXT NOT NULL,
  platform_review_id TEXT,
  reviewer_name TEXT,
  reviewer_avatar_url TEXT,
  reviewer_platform_id TEXT,
  rating SMALLINT,
  rating_raw TEXT,
  title TEXT,
  body TEXT,
  language TEXT DEFAULT 'en',
  review_date TIMESTAMPTZ NOT NULL,
  sub_ratings JSONB DEFAULT '{}',
  sentiment TEXT,
  sentiment_score DECIMAL(3,2),
  detected_topics TEXT[],
  detected_language TEXT,
  summary TEXT,
  key_phrases TEXT[],
  urgency TEXT DEFAULT 'normal',
  response_status TEXT DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  notes TEXT,
  import_batch_id UUID,
  platform_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_reviews_platform_dedup ON reviews(property_id, platform, platform_review_id)
  WHERE platform_review_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_reviews_property_date ON reviews(property_id, review_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_property_status ON reviews(property_id, response_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_property_rating ON reviews(property_id, rating) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_property_sentiment ON reviews(property_id, sentiment) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_topics ON reviews USING GIN(detected_topics);
CREATE INDEX idx_reviews_org ON reviews(organization_id, review_date DESC) WHERE deleted_at IS NULL;

ALTER TABLE reviews ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))) STORED;
CREATE INDEX idx_reviews_fts ON reviews USING GIN(fts);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
