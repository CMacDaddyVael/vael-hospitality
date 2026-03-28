"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { guestSchema } from "@/lib/validations/guests";
import { getUserOrg } from "./_helpers";

export async function createGuest(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = guestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("guests").insert({
    property_id: propertyId,
    organization_id: ctx.organizationId,
    ...parsed.data,
    email: parsed.data.email || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}

export async function updateGuest(guestId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = guestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("guests")
    .update({ ...parsed.data, email: parsed.data.email || null })
    .eq("id", guestId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("guests")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", guestId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}

export async function updateGuestTags(guestId: string, tags: string[]) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("guests")
    .update({ tags })
    .eq("id", guestId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}
