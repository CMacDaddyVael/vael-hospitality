import { createClient } from "@/lib/supabase/server";
import { BrandVoiceForm } from "@/components/brand-voice/brand-voice-form";

export default async function BrandVoiceSettingsPage() {
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

  const { data: brandVoice } = await supabase
    .from("brand_voices")
    .select("*")
    .eq("property_id", propertyId)
    .eq("is_active", true)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Brand Voice</h1>
      <BrandVoiceForm propertyId={propertyId} initialData={brandVoice} />
    </div>
  );
}
