-- Helper function: get user's org IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM memberships
  WHERE user_id = auth.uid() AND deleted_at IS NULL
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get user's org IDs with write access
CREATE OR REPLACE FUNCTION get_user_write_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM memberships
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND deleted_at IS NULL
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));
CREATE POLICY "org_insert" ON organizations FOR INSERT
  WITH CHECK (true);
CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (id IN (SELECT get_user_org_ids()));

-- Memberships
CREATE POLICY "membership_select" ON memberships FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "membership_insert" ON memberships FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "membership_update" ON memberships FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Macro for all org-scoped tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'properties', 'brand_voices', 'smart_snippets', 'review_sources',
    'reviews', 'review_responses', 'automation_rules',
    'review_analytics_daily', 'chat_conversations', 'chat_messages',
    'import_batches'
  ] LOOP
    -- For chat_messages, the org check goes through conversation
    IF tbl = 'chat_messages' THEN
      EXECUTE format(
        'CREATE POLICY "%1$s_select" ON %1$s FOR SELECT USING (
          conversation_id IN (
            SELECT id FROM chat_conversations WHERE organization_id IN (SELECT get_user_org_ids())
          )
        )', tbl);
      EXECUTE format(
        'CREATE POLICY "%1$s_insert" ON %1$s FOR INSERT WITH CHECK (
          conversation_id IN (
            SELECT id FROM chat_conversations WHERE organization_id IN (SELECT get_user_write_org_ids())
          )
        )', tbl);
    ELSE
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
    END IF;
  END LOOP;
END $$;
