import { createClient } from "@/lib/supabase/server";
import { matchUpsellOffers } from "@/lib/ai/match-upsell-offers";
import { generateGuestMessage } from "@/lib/ai/generate-guest-message";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { reservationId } = await req.json();

  const { data: reservation } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (!reservation) return new Response("Reservation not found", { status: 404 });

  const [guestRes, offersRes, propertyRes, brandVoiceRes] = await Promise.all([
    supabase.from("guests").select("*").eq("id", reservation.guest_id).single(),
    supabase.from("upsell_offers").select("*").eq("property_id", reservation.property_id).eq("is_active", true).is("deleted_at", null),
    supabase.from("properties").select("*").eq("id", reservation.property_id).single(),
    supabase.from("brand_voices").select("*").eq("property_id", reservation.property_id).eq("is_active", true).single(),
  ]);

  if (!guestRes.data || !propertyRes.data) {
    return new Response("Missing data", { status: 404 });
  }

  // Match offers
  const matches = await matchUpsellOffers(guestRes.data, reservation, offersRes.data ?? []);

  // Build offers with match data
  const allOffers = (offersRes.data ?? []) as Array<Record<string, unknown>>;
  const matchedOffers = matches
    .map((match) => {
      const offer = allOffers.find((o) => o.id === match.offer_id);
      return offer ? { ...offer, match } : null;
    })
    .filter(Boolean) as any;

  // Generate message
  const result = await generateGuestMessage({
    messageType: "pre_arrival_upsell",
    guest: guestRes.data,
    reservation,
    property: propertyRes.data,
    brandVoice: brandVoiceRes.data ?? {
      tone: "professional_friendly",
      language: "en",
      sign_off: "Warm regards,\nThe Team",
    } as any,
    offers: matchedOffers,
  });

  return result.toTextStreamResponse();
}
