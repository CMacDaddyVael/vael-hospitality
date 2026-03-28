"use client";

import type { Review } from "@/lib/types";
import { RatingStars } from "./rating-stars";
import { ReviewStatusBadge } from "./review-status-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ReviewCard({
  review,
  isActive,
  onClick,
}: {
  review: Review;
  isActive: boolean;
  onClick: () => void;
}) {
  const sentimentColors: Record<string, string> = {
    positive: "bg-green-100 text-green-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-700",
    mixed: "bg-yellow-100 text-yellow-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left border-b p-4 transition-colors hover:bg-gray-50",
        isActive && "bg-blue-50 border-l-2 border-l-blue-500"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">
              {review.reviewer_name ?? "Anonymous"}
            </span>
            <PlatformIcon platform={review.platform} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={review.rating} />
            <span className="text-xs text-gray-400">
              {format(new Date(review.review_date), "MMM d, yyyy")}
            </span>
          </div>
          {review.title && (
            <p className="text-sm font-medium text-gray-800 mb-1 truncate">
              {review.title}
            </p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">{review.body}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {review.sentiment && (
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  sentimentColors[review.sentiment] ?? sentimentColors.neutral
                )}
              >
                {review.sentiment}
              </span>
            )}
            {review.detected_topics?.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs py-0">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        <ReviewStatusBadge status={review.response_status} />
      </div>
    </button>
  );
}
