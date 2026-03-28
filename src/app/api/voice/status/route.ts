import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient } from "@/lib/ai/client";
import { parseAIJSON } from "@/lib/ai/parse-json";
import { validateTwilioRequest } from "@/lib/voice/twilio-auth";

export async function POST(req: Request) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const authError = validateTwilioRequest(req, params, "/api/voice/status");
  if (authError) return authError;

  const callSid = params.get("CallSid") ?? "";
  const callStatus = params.get("CallStatus") ?? "";
  const duration = parseInt(params.get("CallDuration") ?? "0", 10);
  const recordingSid = params.get("RecordingSid");
  const recordingUrl = params.get("RecordingUrl");

  const supabase = createAdminClient();

  const statusMap: Record<string, string> = {
    completed: "completed",
    "no-answer": "no_answer",
    busy: "failed",
    failed: "failed",
    canceled: "failed",
  };

  const { data: call } = await supabase
    .from("voice_calls").select("id")
    .eq("twilio_call_sid", callSid).single();

  if (!call) return NextResponse.json({ received: true });

  const { error: updateError } = await supabase
    .from("voice_calls")
    .update({
      status: statusMap[callStatus] ?? callStatus,
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
      twilio_recording_sid: recordingSid,
      twilio_recording_url: recordingUrl,
      cost_telephony: duration * 0.009,
    })
    .eq("id", call.id);

  if (updateError) {
    console.error("[voice/status] Failed to update call record:", updateError);
  }

  summarizeCall(call.id).catch((err) => {
    console.error("[voice/status] Call summarization failed:", err);
  });

  return NextResponse.json({ received: true });
}

async function summarizeCall(callId: string) {
  const supabase = createAdminClient();

  const { data: messages } = await supabase
    .from("voice_call_messages").select("role, content")
    .eq("call_id", callId).order("created_at");

  if (!messages?.length) return;

  const transcript = messages
    .map((m) => `${m.role === "caller" ? "Caller" : "AI"}: ${m.content}`)
    .join("\n");

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 300,
    system: "Analyze this hotel phone call transcript. Return ONLY valid JSON.",
    messages: [{
      role: "user",
      content: `Transcript:\n${transcript}\n\nReturn:\n{"summary": "<1-2 sentence summary>", "topics": [<strings>], "sentiment": "positive"|"neutral"|"negative", "resolution": "resolved"|"transferred"|"callback_needed"|"unresolved", "detected_language": "<ISO code>"}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const analysis = parseAIJSON<{
    summary: string; topics: string[]; sentiment: string;
    resolution: string; detected_language: string;
  }>(text);

  const { error } = await supabase
    .from("voice_calls")
    .update({
      summary: analysis.summary, topics: analysis.topics,
      sentiment: analysis.sentiment, resolution: analysis.resolution,
      detected_language: analysis.detected_language,
    })
    .eq("id", callId);

  if (error) {
    console.error("[summarizeCall] DB update failed:", error);
  }
}
