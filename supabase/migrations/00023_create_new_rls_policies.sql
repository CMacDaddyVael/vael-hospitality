-- RLS for all new tables (same pattern as 00013)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'pms_connections', 'guests', 'reservations', 'guest_timeline_events',
    'upsell_offers', 'upsell_sends', 'guest_messages', 'upsell_analytics_daily'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "%1$s_select" ON %1$s FOR SELECT USING (
        organization_id IN (SELECT get_user_org_ids())
      )', tbl);
    EXECUTE format(
      'CREATE POLICY "%1$s_insert" ON %1$s FOR INSERT WITH CHECK (
        organization_id IN (SELECT get_user_write_org_ids())
      )', tbl);
    EXECUTE format(
      'CREATE POLICY "%1$s_update" ON %1$s FOR UPDATE USING (
        organization_id IN (SELECT get_user_write_org_ids())
      )', tbl);
  END LOOP;
END $$;

-- Add updated_at triggers to new tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'pms_connections', 'guests', 'reservations', 'upsell_offers',
    'upsell_sends', 'guest_messages', 'upsell_analytics_daily'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl
    );
  END LOOP;
END $$;
