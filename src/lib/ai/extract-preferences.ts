import { getAnthropicClient } from "./client";
import { parseAIJSON } from "./parse-json";
import type { Guest, Review, Reservation, GuestPreferences } from "@/lib/types";

const SYSTEM = `You are a guest preference analysis engine for a hotel. Analyze the provided guest data and extract structured preferences. Return ONLY valid JSON — no markdown, no code fences.`;

export type GuestAnalysisResult = {
  segment: string;
  segment_confidence: number;
  preferences: GuestPreferences;
  summary: string;
};

export async function extractPreferences(
  guest: Guest,
  reviews: Review[],
  reservations: Reservation[]
): Promise<GuestAnalysisResult> {
  const client = getAnthropicClient();

  const reviewsText = reviews
    .map(
      (r) =>
        `- Rating: ${r.rating}/5, Topics: ${(r.detected_topics ?? []).join(", ")}\n  "${r.body?.slice(0, 300) ?? ""}"`
    )
    .join("\n");

  const staysText = reservations
    .map(
      (r) =>
        `- ${r.check_in} to ${r.check_out}, Room: ${r.room_type ?? "unknown"}, Rate: ${r.rate_amount ?? "?"} ${r.rate_currency}, Source: ${r.source ?? "unknown"}, Status: ${r.status}`
    )
    .join("\n");

  const avgSpend =
    reservations.length > 0
      ? (
          reservations.reduce((sum, r) => sum + (r.total_amount ?? 0), 0) /
          reservations.length
        ).toFixed(0)
      : "unknown";

  const prompt = `Guest: ${guest.first_name ?? ""} ${guest.last_name ?? ""}
Email: ${guest.email ?? "unknown"}
Nationality: ${guest.nationality ?? "unknown"}
Total stays: ${guest.total_stays}
Average spend per stay: $${avgSpend}

Stays:
${staysText || "No stay data available."}

Reviews by this guest:
${reviewsText || "No reviews available."}

Return this JSON:
{
  "segment": "business" | "family" | "couple" | "luxury" | "budget" | "group",
  "segment_confidence": <0.0-1.0>,
  "preferences": {
    "room_type": "<preferred room type or null>",
    "floor_preference": "high" | "low" | null,
    "bed_type": "king" | "twin" | null,
    "dietary": ["<restrictions>"],
    "amenities": ["<preferred amenities>"],
    "communication_style": "formal" | "casual" | "minimal",
    "price_sensitivity": "low" | "medium" | "high",
    "interests": ["<spa, dining, tours, etc.>"]
  },
  "summary": "<2-3 sentence guest summary>"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 500,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseAIJSON<GuestAnalysisResult>(text);
}
