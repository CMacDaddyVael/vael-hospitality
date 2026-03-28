"use server";

import { createClient } from "@/lib/supabase/server";
import { smartSnippetSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getUserOrg } from "./_helpers";

export async function createSnippet(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = smartSnippetSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: property } = await supabase
    .from("properties")
    .select("organization_id")
    .eq("id", propertyId)
    .eq("organization_id", ctx.organizationId)
    .single();

  if (!property) return { error: "Property not found" };

  const { error } = await supabase.from("smart_snippets").insert({
    property_id: propertyId,
    organization_id: property.organization_id,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings/smart-snippets");
  return { success: true };
}

export async function updateSnippet(snippetId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = smartSnippetSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("smart_snippets")
    .update(parsed.data)
    .eq("id", snippetId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/settings/smart-snippets");
  return { success: true };
}

export async function deleteSnippet(snippetId: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("smart_snippets")
    .delete()
    .eq("id", snippetId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/settings/smart-snippets");
  return { success: true };
}
