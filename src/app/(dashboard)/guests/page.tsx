import { createClient } from "@/lib/supabase/server";
import { GuestDirectory } from "@/components/guests/guest-directory";

export default async function GuestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership) return null;

  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .is("deleted_at", null)
    .limit(1);

  const propertyId = properties?.[0]?.id;
  if (!propertyId) return <div>No property found.</div>;

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("last_stay_at", { ascending: false, nullsFirst: false });

  return <GuestDirectory guests={guests ?? []} propertyId={propertyId} />;
}
