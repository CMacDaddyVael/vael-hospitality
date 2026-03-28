import { createClient } from "@/lib/supabase/server";
import { SnippetList } from "@/components/smart-snippets/snippet-list";

export default async function SmartSnippetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("organization_id", membership!.organization_id)
    .is("deleted_at", null)
    .limit(1);

  const propertyId = properties?.[0]?.id;
  if (!propertyId) return <div>No property found.</div>;

  const { data: snippets } = await supabase
    .from("smart_snippets")
    .select("*")
    .eq("property_id", propertyId)
    .order("priority", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Smart Snippets</h1>
      <SnippetList propertyId={propertyId} snippets={snippets ?? []} />
    </div>
  );
}
