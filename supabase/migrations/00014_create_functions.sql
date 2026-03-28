-- Refresh daily analytics for a property + date
CREATE OR REPLACE FUNCTION refresh_daily_analytics(p_property_id UUID, p_date DATE)
RETURNS void AS $$
  INSERT INTO review_analytics_daily (
    property_id, organization_id, date, platform,
    review_count, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count,
    avg_rating, positive_count, negative_count, neutral_count, mixed_count,
    avg_sentiment_score, responded_count, topic_counts
  )
  SELECT
    r.property_id,
    r.organization_id,
    p_date,
    r.platform,
    COUNT(*),
    COUNT(*) FILTER (WHERE rating = 1),
    COUNT(*) FILTER (WHERE rating = 2),
    COUNT(*) FILTER (WHERE rating = 3),
    COUNT(*) FILTER (WHERE rating = 4),
    COUNT(*) FILTER (WHERE rating = 5),
    AVG(rating)::DECIMAL(3,2),
    COUNT(*) FILTER (WHERE sentiment = 'positive'),
    COUNT(*) FILTER (WHERE sentiment = 'negative'),
    COUNT(*) FILTER (WHERE sentiment = 'neutral'),
    COUNT(*) FILTER (WHERE sentiment = 'mixed'),
    AVG(sentiment_score)::DECIMAL(3,2),
    COUNT(*) FILTER (WHERE response_status = 'published'),
    (SELECT jsonb_object_agg(topic, cnt) FROM (
      SELECT unnest(detected_topics) AS topic, COUNT(*) AS cnt
      FROM reviews
      WHERE property_id = p_property_id AND review_date::date = p_date AND deleted_at IS NULL
      GROUP BY topic
    ) t)
  FROM reviews r
  WHERE r.property_id = p_property_id
    AND r.review_date::date = p_date
    AND r.deleted_at IS NULL
  GROUP BY r.property_id, r.organization_id, r.platform
  ON CONFLICT (property_id, date, platform)
  DO UPDATE SET
    review_count = EXCLUDED.review_count,
    rating_1_count = EXCLUDED.rating_1_count,
    rating_2_count = EXCLUDED.rating_2_count,
    rating_3_count = EXCLUDED.rating_3_count,
    rating_4_count = EXCLUDED.rating_4_count,
    rating_5_count = EXCLUDED.rating_5_count,
    avg_rating = EXCLUDED.avg_rating,
    positive_count = EXCLUDED.positive_count,
    negative_count = EXCLUDED.negative_count,
    neutral_count = EXCLUDED.neutral_count,
    mixed_count = EXCLUDED.mixed_count,
    avg_sentiment_score = EXCLUDED.avg_sentiment_score,
    responded_count = EXCLUDED.responded_count,
    topic_counts = EXCLUDED.topic_counts;
$$ LANGUAGE sql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'organizations', 'properties', 'brand_voices', 'smart_snippets',
    'review_sources', 'reviews', 'review_responses', 'automation_rules',
    'chat_conversations'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl
    );
  END LOOP;
END $$;
