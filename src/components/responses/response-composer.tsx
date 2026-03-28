"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import type { ReviewResponse } from "@/lib/types";
import { saveResponseDraft, publishResponse } from "@/actions/responses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Check } from "lucide-react";

export function ResponseComposer({
  reviewId,
  propertyId,
  existingResponse,
}: {
  reviewId: string;
  propertyId: string;
  existingResponse?: ReviewResponse | null;
}) {
  const [responseText, setResponseText] = useState(
    existingResponse?.edited_text ??
      existingResponse?.ai_generated_text ??
      ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(
    existingResponse?.status === "published"
  );

  const { complete, isLoading: isGenerating } = useCompletion({
    api: "/api/ai/generate-response",
    body: { reviewId, propertyId },
    onFinish: async (_prompt, completion) => {
      setResponseText(completion);
      await saveResponseDraft(reviewId, completion);
    },
  });

  const handleGenerate = async () => {
    setResponseText("");
    await complete("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveResponseDraft(reviewId, responseText);
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!existingResponse?.id) {
      await saveResponseDraft(reviewId, responseText);
    }
    setIsPublishing(true);
    // Need to get the response ID - for now save and then publish
    const result = await publishResponse(existingResponse?.id ?? "");
    if (!result.error) setPublished(true);
    setIsPublishing(false);
  };

  if (published) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            Response Published
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">
            {existingResponse?.published_text ?? responseText}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Response</CardTitle>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            variant="outline"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Write your response or click 'Generate with AI'..."
          rows={8}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {responseText.split(/\s+/).filter(Boolean).length} words
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!responseText || isSaving}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={!responseText || isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
