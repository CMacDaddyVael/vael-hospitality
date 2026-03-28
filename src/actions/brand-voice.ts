"use server";

import { createClient } from "@/lib/supabase/server";
import { brandVoiceSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getUserOrg } from "./_helpers";

export async function upsertBrandVoice(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = brandVoiceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: property } = await supabase
    .from("properties")
    .select("organization_id")
    .eq("id", propertyId)
    .eq("organization_id", ctx.organizationId)
    .single();

  if (!property) return { error: "Property not found" };

  const { data: existing } = await supabase
    .from("brand_voices")
    .select("id")
    .eq("property_id", propertyId)
    .eq("is_active", true)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("brand_voices")
      .update(parsed.data)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("brand_voices").insert({
      property_id: propertyId,
      organization_id: property.organization_id,
      ...parsed.data,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/settings/brand-voice");
  return { success: true };
}
