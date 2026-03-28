import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { batchAnalyzeReviews } from "@/lib/ai/analyze-review";

const MAX_BATCH_SIZE = 100;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewIds } = await req.json();

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    return NextResponse.json({ analyzed: 0 });
  }

  const cappedIds = reviewIds.slice(0, MAX_BATCH_SIZE);
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, body, rating")
    .in("id", cappedIds)
    .is("sentiment", null);

  if (!reviews?.length) {
    return NextResponse.json({ analyzed: 0 });
  }

  const analyses = await batchAnalyzeReviews(
    reviews.map((r) => ({ id: r.id, body: r.body ?? "", rating: r.rating }))
  );

  let updated = 0;
  for (const [id, analysis] of analyses) {
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
      .eq("id", id);
    if (!error) updated++;
  }

  return NextResponse.json({ analyzed: updated });
}
