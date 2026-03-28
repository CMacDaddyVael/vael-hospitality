import { describe, it, expect } from "vitest";
import { matchSnippetsToTopics } from "@/lib/ai/snippet-matcher";
import type { SmartSnippet } from "@/lib/types";

function makeSnippet(overrides: Partial<SmartSnippet> = {}): SmartSnippet {
  return {
    id: "1",
    property_id: "p1",
    organization_id: "o1",
    topic: "parking",
    topic_keywords: ["parking", "car park"],
    sentiment: "any",
    talking_points: ["Free underground parking"],
    is_active: true,
    priority: 0,
    usage_count: 0,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("matchSnippetsToTopics", () => {
  it("returns empty array when no topics", () => {
    const snippets = [makeSnippet()];
    expect(matchSnippetsToTopics(snippets, [], "positive")).toEqual([]);
  });

  it("matches snippet by topic keyword", () => {
    const snippets = [makeSnippet({ topic: "parking", topic_keywords: ["parking", "car park"] })];
    const result = matchSnippetsToTopics(snippets, ["parking"], "positive");
    expect(result).toHaveLength(1);
    expect(result[0].topic).toBe("parking");
  });

  it("matches with partial keyword overlap", () => {
    const snippets = [makeSnippet({ topic_keywords: ["car park", "garage"] })];
    const result = matchSnippetsToTopics(snippets, ["car park"], "neutral");
    expect(result).toHaveLength(1);
  });

  it("filters by sentiment", () => {
    const snippets = [
      makeSnippet({ id: "1", sentiment: "positive" }),
      makeSnippet({ id: "2", sentiment: "negative" }),
    ];
    const result = matchSnippetsToTopics(snippets, ["parking"], "positive");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("includes 'any' sentiment snippets regardless", () => {
    const snippets = [
      makeSnippet({ id: "1", sentiment: "any" }),
      makeSnippet({ id: "2", sentiment: "negative" }),
    ];
    const result = matchSnippetsToTopics(snippets, ["parking"], "positive");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("sorts by priority descending", () => {
    const snippets = [
      makeSnippet({ id: "low", priority: 1, topic: "breakfast", topic_keywords: ["breakfast"] }),
      makeSnippet({ id: "high", priority: 10, topic: "breakfast", topic_keywords: ["breakfast"] }),
    ];
    const result = matchSnippetsToTopics(snippets, ["breakfast"], "positive");
    expect(result[0].id).toBe("high");
  });

  it("limits to 5 matches max", () => {
    const snippets = Array.from({ length: 10 }, (_, i) =>
      makeSnippet({ id: String(i), topic_keywords: ["wifi"], topic: "wifi" })
    );
    const result = matchSnippetsToTopics(snippets, ["wifi"], "neutral");
    expect(result).toHaveLength(5);
  });
});
