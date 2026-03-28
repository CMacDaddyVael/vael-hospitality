import { getAnthropicClient } from "@/lib/ai/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { composeVoiceSystemPrompt } from "./compose-voice-prompt";
import { voiceTools } from "./voice-tools";
import { executeVoiceTool } from "./voice-tool-handlers";
import type { VoiceConfiguration, Property, BrandVoice, VoiceKnowledgeEntry } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

const MAX_HISTORY_TURNS = 40;
const MAX_TOOL_ITERATIONS = 3;

type ProcessResult = {
  responseText: string;
  shouldTransfer?: { department: string; number: string };
  shouldHangup?: boolean;
  toolsUsed: Array<{ name: string; input: unknown; result: string }>;
};

export async function processCallerInput(
  callId: string,
  callerText: string,
  confidence: number
): Promise<ProcessResult> {
  const supabase = createAdminClient();
  const startTime = Date.now();

  const { data: call, error: callError } = await supabase
    .from("voice_calls").select("*").eq("id", callId).single();

  if (callError || !call) {
    throw new Error(`Call not found: ${callId}`);
  }

  const [configRes, propertyRes, brandVoiceRes, kbRes, historyRes] = await Promise.all([
    supabase.from("voice_configurations").select("*").eq("property_id", call.property_id).single(),
    supabase.from("properties").select("*").eq("id", call.property_id).single(),
    supabase.from("brand_voices").select("*").eq("property_id", call.property_id).eq("is_active", true).single(),
    supabase.from("voice_knowledge_base").select("*").eq("property_id", call.property_id).eq("is_active", true).is("deleted_at", null),
    supabase.from("voice_call_messages").select("*").eq("call_id", callId).order("created_at").limit(MAX_HISTORY_TURNS),
  ]);

  if (!configRes.data || !propertyRes.data) {
    throw new Error(`Missing config or property for call ${callId}`);
  }

  const config = configRes.data as VoiceConfiguration;
  const property = propertyRes.data as Property;

  // Load guest context with property scoping
  let guestContext = null;
  if (call.guest_id) {
    const [guestRes, resRes] = await Promise.all([
      supabase.from("guests").select("*").eq("id", call.guest_id).eq("property_id", call.property_id).single(),
      supabase.from("reservations").select("*").eq("guest_id", call.guest_id).eq("property_id", call.property_id).is("deleted_at", null).order("check_in", { ascending: false }).limit(5),
    ]);
    if (guestRes.data) {
      guestContext = { guest: guestRes.data, reservations: resRes.data ?? [] };
    }
  }

  const systemPrompt = composeVoiceSystemPrompt(
    property, config,
    brandVoiceRes.data as BrandVoice | null,
    (kbRes.data ?? []) as VoiceKnowledgeEntry[],
    guestContext
  );

  const messages: Anthropic.MessageParam[] = (historyRes.data ?? []).map((m) => ({
    role: m.role === "caller" ? "user" as const : "assistant" as const,
    content: m.content,
  }));

  messages.push({ role: "user", content: callerText });

  // Save caller message (check error)
  const { error: msgError } = await supabase.from("voice_call_messages").insert({
    call_id: callId, role: "caller", content: callerText, confidence,
  });
  if (msgError) {
    console.error("[call-processor] Failed to save caller message:", msgError);
  }

  const client = getAnthropicClient();
  const toolsUsed: ProcessResult["toolsUsed"] = [];

  let response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systemPrompt,
    messages,
    tools: voiceTools,
  });

  let iterations = 0;
  while (response.stop_reason === "tool_use" && iterations < MAX_TOOL_ITERATIONS) {
    iterations++;
    const toolBlock = response.content.find((b) => b.type === "tool_use") as Anthropic.ToolUseBlock;
    if (!toolBlock) break;

    let toolResult: string;
    try {
      toolResult = await executeVoiceTool(toolBlock.name, toolBlock.input as Record<string, unknown>, {
        propertyId: call.property_id,
        organizationId: call.organization_id,
        callId,
        callerPhone: call.caller_phone ?? undefined,
      });
    } catch (err) {
      console.error(`[call-processor] Tool ${toolBlock.name} failed:`, err);
      toolResult = "Sorry, that action failed. Please try again or ask for a transfer.";
    }

    toolsUsed.push({ name: toolBlock.name, input: toolBlock.input, result: toolResult });

    // Check for transfer
    if (toolResult.startsWith("__TRANSFER__:")) {
      const dept = toolResult.replace("__TRANSFER__:", "");
      const transferDepts = config.transfer_departments ?? [];
      const target = transferDepts.find((d) => d.name.toLowerCase() === dept.toLowerCase());

      const latency = Date.now() - startTime;
      await supabase.from("voice_call_messages").insert({
        call_id: callId, role: "assistant",
        content: `Transferring to ${dept}...`, tool_calls: toolsUsed, latency_ms: latency,
      });

      return {
        responseText: `Let me transfer you to our ${dept}. One moment please.`,
        shouldTransfer: {
          department: dept,
          number: target?.number || config.forwarding_number || "",
        },
        toolsUsed,
      };
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: toolBlock.id, content: toolResult }],
    });

    response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages,
      tools: voiceTools,
    });
  }

  const textBlock = response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined;
  const responseText = textBlock?.text ?? "I'm sorry, could you please repeat that?";

  if (!textBlock) {
    console.warn("[call-processor] No text block in Claude response for call", callId);
  }

  const latency = Date.now() - startTime;

  const { error: assistantMsgError } = await supabase.from("voice_call_messages").insert({
    call_id: callId, role: "assistant", content: responseText,
    tool_calls: toolsUsed.length > 0 ? toolsUsed : null, latency_ms: latency,
  });
  if (assistantMsgError) {
    console.error("[call-processor] Failed to save assistant message:", assistantMsgError);
  }

  const lowerResponse = responseText.toLowerCase();
  const shouldHangup = lowerResponse.includes("goodbye") || lowerResponse.includes("have a great day");

  return { responseText, shouldHangup, toolsUsed };
}
