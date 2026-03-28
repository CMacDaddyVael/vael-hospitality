import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "md" }) {
  if (rating == null) return <span className="text-gray-400 text-xs">No rating</span>;

  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            sizeClass,
            n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
          )}
        />
      ))}
    </div>
  );
}
