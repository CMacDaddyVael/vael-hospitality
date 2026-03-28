"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { reservationSchema } from "@/lib/validations/guests";
import { getUserOrg } from "./_helpers";

export async function createReservation(propertyId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = reservationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("reservations").insert({
    property_id: propertyId,
    organization_id: ctx.organizationId,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}

export async function updateReservation(reservationId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = reservationSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("reservations")
    .update(parsed.data)
    .eq("id", reservationId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/guests");
  return { success: true };
}
