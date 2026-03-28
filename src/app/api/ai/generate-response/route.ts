import { createClient } from "@/lib/supabase/server";
import { generateReviewResponse } from "@/lib/ai/generate-response";
import type { Property, BrandVoice, SmartSnippet, Review } from "@/lib/types";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { reviewId, propertyId } = await req.json();

  // Get user's org for ownership check
  const { data: membership } = await supabase
    .from("memberships").select("organization_id")
    .eq("user_id", user.id).is("deleted_at", null).single();

  if (!membership) return new Response("No organization", { status: 403 });

  const [reviewRes, propertyRes, brandVoiceRes, snippetsRes] = await Promise.all([
    supabase.from("reviews").select("*").eq("id", reviewId).eq("organization_id", membership.organization_id).single(),
    supabase.from("properties").select("*").eq("id", propertyId).eq("organization_id", membership.organization_id).single(),
    supabase.from("brand_voices").select("*").eq("property_id", propertyId).eq("is_active", true).single(),
    supabase.from("smart_snippets").select("*").eq("property_id", propertyId).eq("is_active", true),
  ]);

  if (!reviewRes.data || !propertyRes.data) {
    return new Response("Review or property not found", { status: 404 });
  }

  const review = reviewRes.data as Review;
  const property = propertyRes.data as Property;
  const brandVoice = (brandVoiceRes.data as BrandVoice) ?? {
    id: "", property_id: propertyId, organization_id: property.organization_id,
    name: "Default", is_active: true, tone: "professional_friendly", language: "en",
    response_length: "medium", greeting_style: "dear_guest",
    sign_off: "Warm regards,\nThe Team", always_include: null, never_include: null,
    property_facts: [], custom_instructions: null, example_responses: [],
    created_at: "", updated_at: "",
  };
  const snippets = (snippetsRes.data as SmartSnippet[]) ?? [];

  try {
    const result = await generateReviewResponse(review, property, brandVoice, snippets);
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[generate-response] AI generation failed:", err);
    return new Response("Failed to generate response", { status: 502 });
  }
}
