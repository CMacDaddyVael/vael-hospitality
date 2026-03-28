"use client";

import { useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PLATFORMS, SENTIMENT_OPTIONS, RESPONSE_STATUSES } from "@/lib/constants";

export function ReviewFilters() {
  const [platform, setPlatform] = useQueryState("platform", { defaultValue: "" });
  const [rating, setRating] = useQueryState("rating", { defaultValue: "" });
  const [sentiment, setSentiment] = useQueryState("sentiment", { defaultValue: "" });
  const [status, setStatus] = useQueryState("status", { defaultValue: "" });
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });

  const hasFilters = platform || rating || sentiment || status || search;

  const clearFilters = () => {
    setPlatform("");
    setRating("");
    setSentiment("");
    setStatus("");
    setSearch("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={platform} onValueChange={(v) => setPlatform(v ?? "")}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Platforms</SelectItem>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rating} onValueChange={(v) => setRating(v ?? "")}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          {[5, 4, 3, 2, 1].map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} Star{n > 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sentiment} onValueChange={(v) => setSentiment(v ?? "")}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiment</SelectItem>
          {SENTIMENT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {RESPONSE_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
