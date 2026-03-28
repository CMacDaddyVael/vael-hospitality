"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserOrg } from "./_helpers";

export async function saveResponseDraft(
  reviewId: string,
  text: string,
  metadata?: {
    promptTokens?: number;
    completionTokens?: number;
    modelUsed?: string;
    generationTimeMs?: number;
    brandVoiceId?: string;
    snippetsUsed?: string[];
  }
) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { data: review } = await supabase
    .from("reviews")
    .select("property_id, organization_id")
    .eq("id", reviewId)
    .eq("organization_id", ctx.organizationId)
    .single();

  if (!review) return { error: "Review not found" };

  const { data: existing } = await supabase
    .from("review_responses")
    .select("id")
    .eq("review_id", reviewId)
    .eq("status", "draft")
    .single();

  if (existing) {
    const { error } = await supabase
      .from("review_responses")
      .update({
        ai_generated_text: text,
        prompt_tokens: metadata?.promptTokens,
        completion_tokens: metadata?.completionTokens,
        model_used: metadata?.modelUsed,
        generation_time_ms: metadata?.generationTimeMs,
        brand_voice_id: metadata?.brandVoiceId,
        snippets_used: metadata?.snippetsUsed,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("review_responses").insert({
      review_id: reviewId,
      property_id: review.property_id,
      organization_id: review.organization_id,
      ai_generated_text: text,
      status: "draft",
      prompt_tokens: metadata?.promptTokens,
      completion_tokens: metadata?.completionTokens,
      model_used: metadata?.modelUsed,
      generation_time_ms: metadata?.generationTimeMs,
      brand_voice_id: metadata?.brandVoiceId,
      snippets_used: metadata?.snippetsUsed,
    });
    if (error) return { error: error.message };
  }

  const { error: statusError } = await supabase
    .from("reviews")
    .update({ response_status: "draft_generated" })
    .eq("id", reviewId);

  if (statusError) {
    console.error("[saveResponseDraft] failed to update review status:", statusError);
  }

  revalidatePath("/reviews");
  return { success: true };
}

export async function editResponse(responseId: string, editedText: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_responses")
    .update({ edited_text: editedText })
    .eq("id", responseId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function publishResponse(responseId: string) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const { data: response } = await supabase
    .from("review_responses")
    .select("*")
    .eq("id", responseId)
    .eq("organization_id", ctx.organizationId)
    .single();

  if (!response) return { error: "Response not found" };

  const publishedText =
    response.edited_text || response.ai_generated_text || "";

  const { error } = await supabase
    .from("review_responses")
    .update({
      published_text: publishedText,
      status: "published",
      published_at: new Date().toISOString(),
      published_by: ctx.user.id,
    })
    .eq("id", responseId);

  if (error) return { error: error.message };

  const { error: reviewError } = await supabase
    .from("reviews")
    .update({
      response_status: "published",
      responded_at: new Date().toISOString(),
      responded_by: ctx.user.id,
    })
    .eq("id", response.review_id);

  if (reviewError) {
    console.error("[publishResponse] failed to update review status:", reviewError);
  }

  revalidatePath("/reviews");
  return { success: true };
}
