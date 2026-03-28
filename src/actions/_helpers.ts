"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserOrg() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  return membership
    ? { user, organizationId: membership.organization_id as string, supabase }
    : null;
}

export async function verifyOwnership(
  table: string,
  id: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select("organization_id")
    .eq("id", id)
    .single();
  return data?.organization_id === organizationId;
}
