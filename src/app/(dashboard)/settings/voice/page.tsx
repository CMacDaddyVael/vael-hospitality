import { createClient } from "@/lib/supabase/server";
import { VoiceSettingsForm } from "@/components/voice/voice-settings-form";

export default async function VoiceSettingsPage() {
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

  const { data: config } = await supabase
    .from("voice_configurations")
    .select("*")
    .eq("property_id", propertyId)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Voice Agent Settings</h1>
      <VoiceSettingsForm propertyId={propertyId} initialData={config} />
    </div>
  );
}
