import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeReview } from "@/lib/ai/analyze-review";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await req.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  // Get user's org for ownership check
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("id, body, rating, organization_id")
    .eq("id", reviewId)
    .eq("organization_id", membership.organization_id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  try {
    const analysis = await analyzeReview(review.body ?? "", review.rating);

    const { error } = await supabase
      .from("reviews")
      .update({
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        detected_topics: analysis.topics,
        summary: analysis.summary,
        key_phrases: analysis.key_phrases,
        urgency: analysis.urgency,
        detected_language: analysis.language,
      })
      .eq("id", reviewId);

    if (error) {
      console.error("[analyze-review] DB update failed:", error);
    }

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze-review] AI analysis failed:", err);
    return NextResponse.json(
      { error: "Failed to analyze review. Please try again." },
      { status: 502 }
    );
  }
}
