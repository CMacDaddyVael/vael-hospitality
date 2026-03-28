import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { Guest, Reservation, Property, BrandVoice, UpsellOfferMatch, UpsellOffer } from "@/lib/types";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type MessageContext = {
  messageType: "welcome" | "pre_arrival_upsell" | "in_stay_recommendation" | "post_stay_thankyou";
  guest: Guest;
  reservation: Reservation;
  property: Property;
  brandVoice: BrandVoice;
  offers?: Array<UpsellOffer & { match: UpsellOfferMatch }>;
};

function getMessageInstructions(type: string): string {
  const instructions: Record<string, string> = {
    welcome: `Write a warm, personalized welcome email for this guest arriving soon. Reference their preferences and make them feel recognized.`,
    pre_arrival_upsell: `Write a pre-arrival email that welcomes the guest and naturally presents personalized upgrade/add-on offers. The offers should feel like helpful suggestions, not aggressive sales. Include offer details with pricing.`,
    in_stay_recommendation: `Write a friendly in-stay message suggesting activities, dining, or experiences the guest might enjoy based on their preferences and interests.`,
    post_stay_thankyou: `Write a personalized thank-you message after the guest's stay. Reference specific aspects of their visit if known. Include a warm invitation to return.`,
  };
  return instructions[type] ?? instructions.welcome;
}

export async function generateGuestMessage(ctx: MessageContext) {
  const { messageType, guest, reservation, property, brandVoice, offers } = ctx;

  const offersSection = offers?.length
    ? `\n## Offers to Include\n${offers
        .map(
          (o) =>
            `### ${o.name} (${o.category}) — ${o.price} ${o.price_currency} ${o.price_type}\n${o.match.personalized_pitch}`
        )
        .join("\n\n")}`
    : "";

  const system = `You are writing a personalized hotel guest email for ${property.name}, a ${property.star_rating ?? ""}${property.star_rating ? "-star " : ""}${property.property_type} in ${property.city ?? ""}${property.country ? `, ${property.country}` : ""}.

## Task
${getMessageInstructions(messageType)}

## Brand Voice
- Tone: ${brandVoice.tone}
- Language: ${brandVoice.language}
- Sign off: ${brandVoice.sign_off}

## Guest Profile
- Name: ${guest.first_name} ${guest.last_name}
- Segment: ${guest.segment ?? "unknown"}
- Preferences: ${JSON.stringify(guest.preferences)}
- Total stays: ${guest.total_stays}
- Tags: ${guest.tags.join(", ") || "none"}

## Reservation
- Check-in: ${reservation.check_in}
- Check-out: ${reservation.check_out}
- Room: ${reservation.room_type ?? "standard"}
- Adults: ${reservation.adults}, Children: ${reservation.children}
- Special requests: ${reservation.special_requests ?? "none"}
${offersSection}

## Rules
1. Address the guest by first name.
2. Keep the email concise (150-250 words).
3. Make it feel personal, not templated.
4. Do not use emojis.
5. Do not use more than 2 exclamation marks.
6. Include a clear subject line at the very top in the format "Subject: ..."`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system,
    messages: [
      { role: "user", content: `Write the ${messageType.replace(/_/g, " ")} email now.` },
    ],
    maxOutputTokens: 500,
  });

  return result;
}
