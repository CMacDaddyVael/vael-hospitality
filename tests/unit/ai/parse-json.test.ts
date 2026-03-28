import { describe, it, expect } from "vitest";
import { parseAIJSON } from "@/lib/ai/parse-json";

describe("parseAIJSON", () => {
  it("parses clean JSON", () => {
    const result = parseAIJSON<{ name: string }>('{"name": "test"}');
    expect(result).toEqual({ name: "test" });
  });

  it("strips markdown code fences", () => {
    const input = '```json\n{"sentiment": "positive"}\n```';
    const result = parseAIJSON<{ sentiment: string }>(input);
    expect(result).toEqual({ sentiment: "positive" });
  });

  it("strips code fences without json label", () => {
    const input = '```\n{"value": 42}\n```';
    const result = parseAIJSON<{ value: number }>(input);
    expect(result).toEqual({ value: 42 });
  });

  it("handles whitespace around JSON", () => {
    const input = '  \n  {"key": "value"}  \n  ';
    const result = parseAIJSON<{ key: string }>(input);
    expect(result).toEqual({ key: "value" });
  });

  it("throws on invalid JSON with clear error", () => {
    expect(() => parseAIJSON("not json at all")).toThrow(
      /Failed to parse AI response as JSON/
    );
  });

  it("throws on empty string", () => {
    expect(() => parseAIJSON("")).toThrow(/Failed to parse AI response as JSON/);
  });

  it("includes raw text in error message", () => {
    try {
      parseAIJSON("Here is the analysis: {broken");
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as Error).message).toContain("Here is the analysis:");
    }
  });

  it("parses nested JSON objects", () => {
    const input = '```json\n{"preferences": {"room_type": "suite", "dietary": ["vegan"]}}\n```';
    const result = parseAIJSON<{ preferences: { room_type: string; dietary: string[] } }>(input);
    expect(result.preferences.room_type).toBe("suite");
    expect(result.preferences.dietary).toEqual(["vegan"]);
  });
});
