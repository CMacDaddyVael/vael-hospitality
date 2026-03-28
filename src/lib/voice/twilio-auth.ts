import twilio from "twilio";

/**
 * Validate that a request came from Twilio.
 * Returns null if valid, or a Response if invalid.
 */
export function validateTwilioRequest(
  req: Request,
  body: URLSearchParams,
  pathOverride?: string
): Response | null {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error("[twilio-auth] TWILIO_AUTH_TOKEN is not configured");
    return new Response("Service not configured", { status: 503 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const baseUrl = process.env.VOICE_WEBHOOK_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const path = pathOverride ?? new URL(req.url).pathname;
  const url = `${baseUrl}${path}`;

  const paramsObj: Record<string, string> = {};
  body.forEach((v, k) => { paramsObj[k] = v; });

  const isValid = twilio.validateRequest(authToken, signature, url, paramsObj);
  if (!isValid) {
    console.warn("[twilio-auth] Invalid Twilio signature for", path);
    return new Response("Invalid signature", { status: 403 });
  }

  return null;
}
