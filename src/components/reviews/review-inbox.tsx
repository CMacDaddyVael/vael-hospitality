"use client";

import { useState } from "react";
import type { Review, ReviewResponse as ReviewResponseType } from "@/lib/types";
import { ReviewCard } from "./review-card";
import { ReviewDetail } from "./review-detail";
import { ReviewFilters } from "./review-filters";
import { CsvImportDialog } from "./csv-import-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ReviewInbox({
  reviews,
  responses,
  propertyId,
}: {
  reviews: Review[];
  responses: Record<string, ReviewResponseType>;
  propertyId: string;
}) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(
    reviews[0]?.id ?? null
  );

  const selectedReview = reviews.find((r) => r.id === selectedReviewId);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <CsvImportDialog propertyId={propertyId} />
      </div>

      <ReviewFilters />

      <div className="flex gap-4 h-[calc(100vh-240px)]">
        {/* Review List */}
        <div className="w-[420px] shrink-0 rounded-lg border bg-white overflow-hidden">
          <ScrollArea className="h-full">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-medium">No reviews yet</p>
                <p className="text-sm mt-1">
                  Import reviews via CSV or connect Google Business Profile
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isActive={review.id === selectedReviewId}
                  onClick={() => setSelectedReviewId(review.id)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Review Detail */}
        <div className="flex-1 overflow-auto">
          {selectedReview ? (
            <ReviewDetail
              review={selectedReview}
              existingResponse={responses[selectedReview.id]}
              propertyId={propertyId}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Select a review to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
