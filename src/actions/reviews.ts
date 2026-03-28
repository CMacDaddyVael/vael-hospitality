"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserOrg } from "./_helpers";

export async function updateReviewStatus(reviewId: string, status: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reviews")
    .update({ response_status: status })
    .eq("id", reviewId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { success: true };
}

export async function skipReview(reviewId: string) {
  return updateReviewStatus(reviewId, "skipped");
}

export async function flagReview(reviewId: string, reason: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reviews")
    .update({ is_flagged: true, flag_reason: reason })
    .eq("id", reviewId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { success: true };
}

export async function addReviewNote(reviewId: string, note: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reviews")
    .update({ notes: note })
    .eq("id", reviewId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  return { success: true };
}
