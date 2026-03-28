"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { upsellOfferSchema } from "@/lib/validations/upsell-offers";
import { getUserOrg } from "./_helpers";

export async function createUpsellOffer(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = upsellOfferSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("upsell_offers").insert({
    property_id: propertyId,
    organization_id: ctx.organizationId,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/upsell/offers");
  return { success: true };
}

export async function updateUpsellOffer(offerId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = upsellOfferSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("upsell_offers")
    .update(parsed.data)
    .eq("id", offerId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/upsell/offers");
  return { success: true };
}

export async function toggleUpsellOffer(offerId: string, isActive: boolean) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("upsell_offers")
    .update({ is_active: isActive })
    .eq("id", offerId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/upsell/offers");
  return { success: true };
}

export async function deleteUpsellOffer(offerId: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("upsell_offers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", offerId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/upsell/offers");
  return { success: true };
}
