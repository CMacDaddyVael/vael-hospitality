import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { Review, Property, BrandVoice, SmartSnippet } from "@/lib/types";
import { composeResponsePrompt } from "./compose-prompt";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function generateReviewResponse(
  review: Review,
  property: Property,
  brandVoice: BrandVoice,
  snippets: SmartSnippet[]
) {
  const { system, user } = composeResponsePrompt(
    review,
    property,
    brandVoice,
    snippets
  );

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system,
    messages: [{ role: "user", content: user }],
    maxOutputTokens: 500,
  });

  return result;
}
