import { createAdminClient } from "@/lib/supabase/admin";
import { buildGreetingTwiml } from "@/lib/voice/twiml-builders";
import { validateTwilioRequest } from "@/lib/voice/twilio-auth";

export async function POST(req: Request) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const authError = validateTwilioRequest(req, params, "/api/voice/inbound");
  if (authError) return authError;

  const callSid = params.get("CallSid") ?? "";
  const callerPhone = params.get("From") ?? "";
  const toNumber = params.get("To") ?? "";

  const supabase = createAdminClient();

  const { data: config } = await supabase
    .from("voice_configurations")
    .select("*, properties(id, name, organization_id)")
    .eq("twilio_phone_number", toNumber)
    .eq("is_enabled", true)
    .single();

  if (!config) {
    return new Response(
      '<Response><Say>We are sorry, this number is not currently active.</Say></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const property = config.properties as Record<string, unknown>;
  const propertyId = property.id as string;
  const orgId = property.organization_id as string;

  let guestId = null;
  if (callerPhone) {
    const { data: guest } = await supabase
      .from("guests").select("id")
      .eq("property_id", propertyId).eq("phone", callerPhone)
      .is("deleted_at", null).limit(1).single();
    guestId = guest?.id ?? null;
  }

  const { data: call, error: callError } = await supabase
    .from("voice_calls")
    .insert({
      property_id: propertyId, organization_id: orgId,
      twilio_call_sid: callSid, caller_phone: callerPhone,
      guest_id: guestId, direction: "inbound", status: "in_progress",
    })
    .select("id").single();

  if (callError || !call) {
    console.error("[voice/inbound] Failed to create call:", callError);
    return new Response(
      '<Response><Say>Technical difficulties. Please try again later.</Say></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const twiml = buildGreetingTwiml(config.greeting_message, call.id, config.voice_id, config.primary_language);
  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}
