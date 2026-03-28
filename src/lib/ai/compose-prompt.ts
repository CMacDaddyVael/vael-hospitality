import type { Review, Property, BrandVoice, SmartSnippet, PropertyFact, ExampleResponse } from "@/lib/types";
import { matchSnippetsToTopics } from "./snippet-matcher";
import { TONE_OPTIONS, GREETING_STYLES, RESPONSE_LENGTHS } from "@/lib/constants";

function getToneDescription(tone: string): string {
  const map: Record<string, string> = {
    professional_friendly:
      "Professional yet warm and approachable. You balance courtesy with genuine personality.",
    casual_warm:
      "Relaxed and conversational, like chatting with a friendly host. Use natural, everyday language.",
    formal_luxury:
      "Elegant and refined. Use sophisticated language befitting a luxury establishment. Never casual.",
    boutique_personal:
      "Intimate and personal, as if the owner is writing directly. Share personal touches and stories.",
  };
  return map[tone] ?? map.professional_friendly;
}

function getLengthGuideline(length: string): { description: string; words: string } {
  const map: Record<string, { description: string; words: string }> = {
    short: { description: "concise and to-the-point", words: "50-80" },
    medium: { description: "thorough but not verbose", words: "80-150" },
    long: { description: "detailed and comprehensive", words: "150-250" },
  };
  return map[length] ?? map.medium;
}

function getGreetingInstruction(style: string): string {
  const map: Record<string, string> = {
    dear_guest: 'Begin with "Dear [Guest Name]," using their actual name if available.',
    hi_name: 'Begin with "Hi [Guest Name]," for a friendly opening.',
    hello: 'Begin with a simple "Hello," greeting.',
    thank_you_opening: "Open by thanking the guest for taking the time to share their feedback.",
  };
  return map[style] ?? map.dear_guest;
}

export function composeResponsePrompt(
  review: Review,
  property: Property,
  brandVoice: BrandVoice,
  allSnippets: SmartSnippet[]
): { system: string; user: string } {
  const matchedSnippets = matchSnippetsToTopics(
    allSnippets,
    review.detected_topics ?? [],
    review.sentiment ?? "neutral"
  );

  const facts = (brandVoice.property_facts as PropertyFact[]) ?? [];
  const examples = (brandVoice.example_responses as ExampleResponse[]) ?? [];
  const lengthGuide = getLengthGuideline(brandVoice.response_length);

  const factsFormatted = facts.length
    ? facts.map((f) => `- [${f.category}] ${f.fact}`).join("\n")
    : "No property facts provided.";

  const snippetsFormatted = matchedSnippets.length
    ? matchedSnippets
        .map(
          (s) =>
            `### Topic: ${s.topic}\n${s.talking_points.map((p) => `- ${p}`).join("\n")}`
        )
        .join("\n\n")
    : "No specific talking points for the detected topics.";

  const examplesFormatted = examples.length
    ? examples
        .map(
          (e, i) =>
            `### Example ${i + 1}\nReview excerpt: "${e.review_excerpt}"\nIdeal response: "${e.ideal_response}"`
        )
        .join("\n\n")
    : "";

  const alwaysInclude = brandVoice.always_include?.length
    ? `Always try to include: ${brandVoice.always_include.join("; ")}`
    : "";

  const neverInclude = brandVoice.never_include?.length
    ? `Never use these words/phrases: ${brandVoice.never_include.join("; ")}`
    : "";

  const system = `You are an expert hotel review response writer for ${property.name}, a ${property.star_rating ?? ""}${property.star_rating ? "-star " : ""}${property.property_type} in ${property.city ?? ""}${property.country ? `, ${property.country}` : ""}.

## Your Role
Write a thoughtful, personalized response to the guest review below. Your response must feel genuine and specific to what the guest described — never generic.

## Brand Voice
- Tone: ${getToneDescription(brandVoice.tone)}
- Response Length: ${lengthGuide.description} (approximately ${lengthGuide.words} words)
- Language: ${brandVoice.language}
- ${getGreetingInstruction(brandVoice.greeting_style)}
- Sign off with: ${brandVoice.sign_off}
${alwaysInclude}
${neverInclude}

## Property Facts (reference when relevant, do NOT force them in)
${factsFormatted}

${brandVoice.custom_instructions ? `## Custom Instructions from Hotel Management\n${brandVoice.custom_instructions}` : ""}

${examplesFormatted ? `## Example Responses (match this style)\n${examplesFormatted}` : ""}

## Relevant Talking Points for Detected Topics
${snippetsFormatted}

## Rules
1. Address specific points the guest mentioned. Quote or paraphrase their language.
2. If the review is negative, acknowledge the issue sincerely before responding.
3. Never be defensive. Never blame the guest.
4. If the guest mentions a specific staff member positively, mention them by name.
5. For negative reviews about issues that have been fixed, mention the fix using property facts.
6. Keep the response to approximately ${lengthGuide.words} words.
7. Write in ${brandVoice.language}.
8. Do not use exclamation marks more than twice.
9. Do not use emojis.
10. Do not invent facts about the property not in the property facts list.`;

  const user = `## Guest Review
Rating: ${review.rating ?? "N/A"}/5
Reviewer: ${review.reviewer_name ?? "Anonymous"}
Date: ${review.review_date}
Platform: ${review.platform}
${review.title ? `Title: ${review.title}` : ""}

"${review.body ?? ""}"

Detected Topics: ${(review.detected_topics ?? []).join(", ") || "none"}
Detected Sentiment: ${review.sentiment ?? "unknown"}

Write the response now.`;

  return { system, user };
}
