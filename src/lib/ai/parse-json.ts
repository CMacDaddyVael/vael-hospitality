/**
 * Safely parse JSON from AI model output.
 * Strips markdown code fences if present and provides clear error messages.
 */
export function parseAIJSON<T>(text: string): T {
  // Strip markdown code fences
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/m, "");
  cleaned = cleaned.replace(/\n?\s*```$/m, "");
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse AI response as JSON: ${(err as Error).message}. Raw output: "${text.slice(0, 200)}"`
    );
  }
}
