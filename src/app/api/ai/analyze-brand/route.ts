import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { parseAIJSON } from "@/lib/ai/parse-json";

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  // Fetch the hotel website
  let pageContent: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VaelBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ error: "Could not fetch website" }, { status: 400 });
    const html = await res.text();

    // Strip HTML to text (simple extraction)
    pageContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch {
    return NextResponse.json({ error: "Failed to load website. Check the URL and try again." }, { status: 400 });
  }

  if (pageContent.length < 50) {
    return NextResponse.json({ error: "Could not extract enough content from the website." }, { status: 400 });
  }

  // Analyze with Claude
  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are a hospitality brand analyst. Analyze a hotel's website content and extract their brand identity to configure an AI review response system. Return ONLY valid JSON — no markdown, no code fences.`,
      messages: [{
        role: "user",
        content: `Analyze this hotel website content and extract the brand voice profile.

Website URL: ${url}
Content:
${pageContent}

Return this exact JSON structure:
{
  "property_name": "<hotel name>",
  "property_type": "hotel" | "resort" | "b_and_b" | "boutique" | "hostel" | "vacation_rental",
  "city": "<city or null>",
  "country": "<country or null>",
  "star_rating": <1-5 or null>,
  "tone": "professional_friendly" | "casual_warm" | "formal_luxury" | "boutique_personal",
  "response_length": "short" | "medium" | "long",
  "greeting_style": "dear_guest" | "hi_name" | "hello" | "thank_you_opening",
  "sign_off": "<appropriate sign-off based on the brand>",
  "custom_instructions": "<2-3 sentences about how this brand communicates — what makes their voice unique>",
  "property_facts": [
    {"category": "<amenity|renovation|dining|spa|location|policy>", "fact": "<specific fact about the property>"}
  ],
  "suggested_snippets": [
    {"topic": "<parking|breakfast|wifi|pool|spa|location|staff|restaurant>", "keywords": ["<trigger words>"], "talking_points": ["<what to say about this topic>"]}
  ]
}

Extract as many property facts and suggested snippets as you can find on the website. Be specific — use actual names, prices, hours, and details from the content.`,
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const analysis = parseAIJSON<{
      property_name: string;
      property_type: string;
      city: string | null;
      country: string | null;
      star_rating: number | null;
      tone: string;
      response_length: string;
      greeting_style: string;
      sign_off: string;
      custom_instructions: string;
      property_facts: Array<{ category: string; fact: string }>;
      suggested_snippets: Array<{ topic: string; keywords: string[]; talking_points: string[] }>;
    }>(text);

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze-brand] AI analysis failed:", err);
    return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 502 });
  }
}
