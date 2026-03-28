import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// Twilio has strict enums for voice/language — we cast since hotels configure these dynamically
type AnyVoice = Parameters<InstanceType<typeof VoiceResponse>["say"]>[0] extends infer T
  ? T extends { voice?: infer V } ? V : never : never;
type AnyLanguage = Parameters<InstanceType<typeof VoiceResponse>["gather"]>[0] extends infer T
  ? T extends { language?: infer L } ? L : never : never;

export function buildGreetingTwiml(
  greeting: string,
  callId: string,
  voiceId: string,
  language: string
): string {
  const response = new VoiceResponse();
  const gather = response.gather({
    input: ["speech"],
    action: `/api/voice/gather?callId=${callId}`,
    method: "POST",
    speechTimeout: "auto",
    language: language as AnyLanguage,
  });
  gather.say({ voice: voiceId as AnyVoice }, greeting);
  response.redirect(`/api/voice/inbound?callId=${callId}&retry=1`);
  return response.toString();
}

export function buildResponseTwiml(
  responseText: string,
  callId: string,
  voiceId: string,
  language: string
): string {
  const response = new VoiceResponse();
  const gather = response.gather({
    input: ["speech"],
    action: `/api/voice/gather?callId=${callId}`,
    method: "POST",
    speechTimeout: "auto",
    language: language as AnyLanguage,
  });
  gather.say({ voice: voiceId as AnyVoice }, responseText);
  response.say(
    { voice: voiceId as AnyVoice },
    "If you need anything else, please don't hesitate to call back. Goodbye."
  );
  return response.toString();
}

export function buildTransferTwiml(
  message: string,
  transferNumber: string,
  voiceId: string
): string {
  const response = new VoiceResponse();
  response.say({ voice: voiceId as AnyVoice }, message);
  response.dial(transferNumber);
  return response.toString();
}

export function buildHangupTwiml(message: string, voiceId: string): string {
  const response = new VoiceResponse();
  response.say({ voice: voiceId as AnyVoice }, message);
  response.hangup();
  return response.toString();
}
