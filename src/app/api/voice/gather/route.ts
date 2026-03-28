import { processCallerInput } from "@/lib/voice/call-processor";
import { buildResponseTwiml, buildTransferTwiml, buildHangupTwiml } from "@/lib/voice/twiml-builders";
import { validateTwilioRequest } from "@/lib/voice/twilio-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get("callId");

  if (!callId) {
    return new Response('<Response><Say>An error occurred.</Say></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);

  // Validate Twilio signature
  const authError = validateTwilioRequest(req, params, `/api/voice/gather?callId=${callId}`);
  if (authError) return authError;

  // Verify callId matches CallSid (prevent IDOR)
  const callSid = params.get("CallSid") ?? "";
  const supabase = createAdminClient();
  const { data: call } = await supabase
    .from("voice_calls")
    .select("id, property_id, twilio_call_sid, started_at")
    .eq("id", callId)
    .single();

  if (!call || call.twilio_call_sid !== callSid) {
    return new Response('<Response><Hangup/></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Enforce max call duration
  const { data: config } = await supabase
    .from("voice_configurations")
    .select("voice_id, primary_language, max_call_duration_seconds")
    .eq("property_id", call.property_id)
    .single();

  const voiceId = config?.voice_id ?? "Polly.Joanna";
  const language = config?.primary_language ?? "en-US";
  const maxDuration = config?.max_call_duration_seconds ?? 600;

  const callAge = (Date.now() - new Date(call.started_at).getTime()) / 1000;
  if (callAge > maxDuration) {
    return new Response(
      buildHangupTwiml("Thank you for calling. We've reached the maximum call duration. Goodbye.", voiceId),
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const speechResult = params.get("SpeechResult") ?? "";
  const confidence = parseFloat(params.get("Confidence") ?? "0");

  if (!speechResult) {
    const twiml = buildResponseTwiml(
      "I'm sorry, I didn't catch that. Could you please repeat?",
      callId, voiceId, language
    );
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  try {
    const result = await processCallerInput(callId, speechResult, confidence);

    let twiml: string;
    if (result.shouldTransfer && result.shouldTransfer.number) {
      twiml = buildTransferTwiml(result.responseText, result.shouldTransfer.number, voiceId);
    } else if (result.shouldHangup) {
      twiml = buildHangupTwiml(result.responseText, voiceId);
    } else {
      twiml = buildResponseTwiml(result.responseText, callId, voiceId, language);
    }

    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (err) {
    console.error("[voice/gather] Error processing call:", err);
    return new Response(
      buildResponseTwiml(
        "I apologize, I'm experiencing a technical issue. Let me transfer you to our front desk.",
        callId, voiceId, language
      ),
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
