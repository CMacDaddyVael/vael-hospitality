import { getAnthropicClient } from "./client";
import { parseAIJSON } from "./parse-json";
import type { Guest, Reservation, UpsellOffer, UpsellOfferMatch } from "@/lib/types";

const SYSTEM = `You are a hotel upselling strategist. Given a guest profile and their upcoming reservation, select the most relevant upsell offers and explain why each is a good fit. Be data-driven. Return ONLY valid JSON — no markdown, no code fences.`;

export async function matchUpsellOffers(
  guest: Guest,
  reservation: Reservation,
  offers: UpsellOffer[]
): Promise<UpsellOfferMatch[]> {
  if (offers.length === 0) return [];

  const client = getAnthropicClient();

  const offersText = offers
    .map(
      (o) =>
        `- ID: ${o.id}, Name: ${o.name}, Category: ${o.category}, Description: ${o.description ?? ""}, Price: ${o.price ?? "?"} ${o.price_currency} (${o.price_type})`
    )
    .join("\n");

  const prompt = `Guest Profile:
- Name: ${guest.first_name} ${guest.last_name}
- Segment: ${guest.segment ?? "unknown"}
- Preferences: ${JSON.stringify(guest.preferences)}
- Past stays: ${guest.total_stays}, avg spend: $${guest.total_stays > 0 ? (guest.total_spend / guest.total_stays).toFixed(0) : "?"}
- Tags: ${guest.tags.join(", ") || "none"}

Upcoming Reservation:
- Check-in: ${reservation.check_in}, Check-out: ${reservation.check_out}
- Room: ${reservation.room_type ?? "standard"}, Rate: ${reservation.rate_amount ?? "?"} ${reservation.rate_currency}
- Adults: ${reservation.adults}, Children: ${reservation.children}
- Source: ${reservation.source ?? "unknown"}
- Special requests: ${reservation.special_requests ?? "none"}

Available Offers:
${offersText}

Select up to 3 offers that best match this guest. Return:
{
  "selected_offers": [
    {
      "offer_id": "<uuid>",
      "rank": 1,
      "reasoning": "<why this offer fits this guest>",
      "personalized_pitch": "<1-2 sentence personalized pitch>"
    }
  ]
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const result = parseAIJSON<{ selected_offers: UpsellOfferMatch[] }>(text);
  return result.selected_offers;
}
