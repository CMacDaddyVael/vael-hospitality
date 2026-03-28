import { getAnthropicClient } from "./client";
import { parseAIJSON } from "./parse-json";
import type { ReviewAnalysis } from "@/lib/types";
import { REVIEW_TOPICS } from "@/lib/constants";

const ANALYSIS_SYSTEM = `You are a hotel review analysis engine. Analyze the guest review and return ONLY valid JSON — no markdown, no code fences, no extra text.`;

function buildAnalysisPrompt(body: string, rating: number | null): string {
  return `Review: "${body}"
Rating: ${rating ?? "N/A"}/5

Return this exact JSON structure:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentiment_score": <float from -1.0 to 1.0>,
  "topics": [<detected topics from: ${REVIEW_TOPICS.join(", ")}>],
  "summary": "<one sentence summary>",
  "key_phrases": [<up to 5 notable phrases>],
  "urgency": "low" | "normal" | "high" | "critical",
  "language": "<ISO 639-1 code>"
}`;
}

export async function analyzeReview(
  body: string,
  rating: number | null
): Promise<ReviewAnalysis> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 300,
    system: ANALYSIS_SYSTEM,
    messages: [{ role: "user", content: buildAnalysisPrompt(body, rating) }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseAIJSON<ReviewAnalysis>(text);
}

export async function batchAnalyzeReviews(
  reviews: Array<{ id: string; body: string; rating: number | null }>
): Promise<Map<string, ReviewAnalysis>> {
  const results = new Map<string, ReviewAnalysis>();
  const batchSize = 5;

  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    const analyses = await Promise.all(
      batch.map(async (review) => {
        try {
          const analysis = await analyzeReview(review.body, review.rating);
          return { id: review.id, analysis };
        } catch (err) {
          console.error(`[batch-analyze] failed for review ${review.id}:`, err);
          return { id: review.id, analysis: null };
        }
      })
    );
    for (const { id, analysis } of analyses) {
      if (analysis) results.set(id, analysis);
    }
  }

  return results;
}
