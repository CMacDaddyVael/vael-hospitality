"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { voiceConfigSchema } from "@/lib/validations/voice";
import { getUserOrg } from "./_helpers";

export async function upsertVoiceConfig(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = voiceConfigSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: existing } = await supabase
    .from("voice_configurations")
    .select("id")
    .eq("property_id", propertyId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("voice_configurations")
      .update(parsed.data)
      .eq("id", existing.id)
      .eq("organization_id", ctx.organizationId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("voice_configurations").insert({
      property_id: propertyId,
      organization_id: ctx.organizationId,
      ...parsed.data,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/settings/voice");
  return { success: true };
}

export async function toggleVoiceEnabled(propertyId: string, enabled: boolean) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("voice_configurations")
    .update({ is_enabled: enabled })
    .eq("property_id", propertyId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/settings/voice");
  return { success: true };
}
