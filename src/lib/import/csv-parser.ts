import Papa from "papaparse";

export type ParsedReview = {
  reviewer_name: string;
  rating: number;
  title?: string;
  body: string;
  review_date: string;
  rating_raw?: string;
};

// Common column name mappings
const COLUMN_MAP: Record<string, keyof ParsedReview> = {
  // Reviewer name variants
  reviewer_name: "reviewer_name",
  name: "reviewer_name",
  guest_name: "reviewer_name",
  guest: "reviewer_name",
  author: "reviewer_name",
  // Rating variants
  rating: "rating",
  score: "rating",
  stars: "rating",
  overall_rating: "rating",
  // Title variants
  title: "title",
  review_title: "title",
  headline: "title",
  // Body variants
  body: "body",
  review: "body",
  comment: "body",
  text: "body",
  review_text: "body",
  positive: "body",
  content: "body",
  // Date variants
  review_date: "review_date",
  date: "review_date",
  created_at: "review_date",
  submitted: "review_date",
};

function normalizeRating(value: string | number, platform: string): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return 3;

  // Booking.com uses 1-10 scale
  if (platform === "booking_com" && num > 5) {
    return Math.round(num / 2);
  }
  return Math.min(5, Math.max(1, Math.round(num)));
}

function parseDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function parseReviewsCsv(
  csvText: string,
  platform: string
): { reviews: ParsedReview[]; errors: Array<{ row: number; error: string }> } {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const reviews: ParsedReview[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i] as Record<string, string>;

    try {
      // Map columns
      const mapped: Partial<ParsedReview> = {};
      for (const [csvCol, value] of Object.entries(row)) {
        const targetField = COLUMN_MAP[csvCol];
        if (targetField && value) {
          (mapped as Record<string, string>)[targetField] = value.trim();
        }
      }

      // Handle Booking.com "positive" + "negative" columns
      if (row.positive || row.negative) {
        const parts: string[] = [];
        if (row.positive) parts.push(`Positive: ${row.positive.trim()}`);
        if (row.negative) parts.push(`Negative: ${row.negative.trim()}`);
        mapped.body = parts.join("\n\n");
      }

      if (!mapped.body) {
        errors.push({ row: i + 1, error: "Missing review text" });
        continue;
      }

      reviews.push({
        reviewer_name: mapped.reviewer_name ?? "Anonymous",
        rating: normalizeRating(mapped.rating ?? "3", platform),
        rating_raw: (mapped as Record<string, string>).rating,
        title: mapped.title,
        body: mapped.body,
        review_date: parseDate(mapped.review_date ?? ""),
      });
    } catch (err) {
      errors.push({ row: i + 1, error: String(err) });
    }
  }

  return { reviews, errors };
}
