"use client";

import type { Review, ReviewResponse as ReviewResponseType } from "@/lib/types";
import { RatingStars } from "./rating-stars";
import { ReviewStatusBadge } from "./review-status-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ResponseComposer } from "@/components/responses/response-composer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Flag, AlertTriangle } from "lucide-react";

export function ReviewDetail({
  review,
  existingResponse,
  propertyId,
}: {
  review: Review;
  existingResponse?: ReviewResponseType | null;
  propertyId: string;
}) {
  const urgencyColors: Record<string, string> = {
    critical: "text-red-600",
    high: "text-orange-600",
    normal: "text-gray-600",
    low: "text-gray-400",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {review.reviewer_name ?? "Anonymous"}
                </h3>
                <PlatformIcon platform={review.platform} />
                <ReviewStatusBadge status={review.response_status} />
              </div>
              <div className="flex items-center gap-3">
                <RatingStars rating={review.rating} size="md" />
                <span className="text-sm text-gray-500">
                  {format(new Date(review.review_date), "MMMM d, yyyy")}
                </span>
                {review.urgency !== "normal" && (
                  <span className={urgencyColors[review.urgency]}>
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    {review.urgency}
                  </span>
                )}
              </div>
            </div>
            {review.is_flagged && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <Flag className="h-4 w-4" />
                Flagged
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {review.title && (
            <h4 className="font-medium mb-2">{review.title}</h4>
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{review.body}</p>

          {review.summary && (
            <>
              <Separator className="my-3" />
              <div className="text-sm">
                <span className="font-medium text-gray-500">AI Summary: </span>
                <span className="text-gray-600">{review.summary}</span>
              </div>
            </>
          )}

          {review.detected_topics && review.detected_topics.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <span className="text-xs text-gray-500">Topics:</span>
              {review.detected_topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {review.key_phrases && review.key_phrases.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">Key phrases:</span>
              {review.key_phrases.map((phrase) => (
                <Badge key={phrase} variant="secondary" className="text-xs">
                  &ldquo;{phrase}&rdquo;
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ResponseComposer
        reviewId={review.id}
        propertyId={propertyId}
        existingResponse={existingResponse}
      />
    </div>
  );
}
