import type { SmartSnippet } from "@/lib/types";

export function matchSnippetsToTopics(
  snippets: SmartSnippet[],
  detectedTopics: string[],
  reviewSentiment: string
): SmartSnippet[] {
  if (!detectedTopics?.length) return [];

  return snippets
    .filter((snippet) => {
      const topicMatch = detectedTopics.some((topic) =>
        snippet.topic_keywords.some(
          (kw) =>
            topic.toLowerCase().includes(kw.toLowerCase()) ||
            kw.toLowerCase().includes(topic.toLowerCase())
        )
      );
      const sentimentMatch =
        snippet.sentiment === "any" || snippet.sentiment === reviewSentiment;
      return topicMatch && sentimentMatch;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}
