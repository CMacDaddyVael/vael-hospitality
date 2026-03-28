"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { knowledgeEntrySchema } from "@/lib/validations/voice";
import { getUserOrg } from "./_helpers";

export async function createKBEntry(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = knowledgeEntrySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("voice_knowledge_base").insert({
    property_id: propertyId,
    organization_id: ctx.organizationId,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings/knowledge-base");
  return { success: true };
}

export async function updateKBEntry(entryId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = knowledgeEntrySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("voice_knowledge_base")
    .update(parsed.data)
    .eq("id", entryId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/settings/knowledge-base");
  return { success: true };
}

export async function deleteKBEntry(entryId: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("voice_knowledge_base")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", entryId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/settings/knowledge-base");
  return { success: true };
}
