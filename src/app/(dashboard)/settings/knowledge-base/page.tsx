import { createClient } from "@/lib/supabase/server";
import { KnowledgeBaseEditor } from "@/components/voice/knowledge-base-editor";

export default async function KnowledgeBasePage() {
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

  const { data: entries } = await supabase
    .from("voice_knowledge_base")
    .select("*")
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("category")
    .order("display_order");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
      <p className="text-sm text-gray-500 mb-6">
        Teach the voice agent everything about your hotel. The more detail you provide, the smarter it gets.
      </p>
      <KnowledgeBaseEditor propertyId={propertyId} entries={entries ?? []} />
    </div>
  );
}
