CREATE OR REPLACE FUNCTION refresh_upsell_analytics(p_property_id UUID, p_date DATE)
RETURNS void AS $$
  INSERT INTO upsell_analytics_daily (
    property_id, organization_id, date,
    sends_count, opens_count, clicks_count, acceptances_count,
    gross_revenue, commission_revenue
  )
  SELECT
    us.property_id,
    us.organization_id,
    p_date,
    COUNT(*),
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL),
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL),
    COUNT(*) FILTER (WHERE array_length(accepted_offer_ids, 1) > 0),
    COALESCE(SUM(total_revenue), 0),
    COALESCE(SUM(commission_amount), 0)
  FROM upsell_sends us
  WHERE us.property_id = p_property_id
    AND us.created_at::date = p_date
  GROUP BY us.property_id, us.organization_id
  ON CONFLICT (property_id, date)
  DO UPDATE SET
    sends_count = EXCLUDED.sends_count,
    opens_count = EXCLUDED.opens_count,
    clicks_count = EXCLUDED.clicks_count,
    acceptances_count = EXCLUDED.acceptances_count,
    gross_revenue = EXCLUDED.gross_revenue,
    commission_revenue = EXCLUDED.commission_revenue,
    updated_at = now();
$$ LANGUAGE sql;
