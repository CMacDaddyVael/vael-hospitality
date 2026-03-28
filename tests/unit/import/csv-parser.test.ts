import { describe, it, expect } from "vitest";
import { parseReviewsCsv } from "@/lib/import/csv-parser";

describe("parseReviewsCsv", () => {
  it("parses basic CSV with standard column names", () => {
    const csv = `name,rating,body,date
John Doe,5,Great hotel,2024-06-15
Jane Smith,3,Okay stay,2024-07-20`;

    const { reviews, errors } = parseReviewsCsv(csv, "google");
    expect(errors).toHaveLength(0);
    expect(reviews).toHaveLength(2);
    expect(reviews[0].reviewer_name).toBe("John Doe");
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].body).toBe("Great hotel");
  });

  it("normalizes Booking.com 10-scale ratings to 5-scale", () => {
    const csv = `name,rating,body,date
Guest,8.5,Nice,2024-01-01`;

    const { reviews } = parseReviewsCsv(csv, "booking_com");
    expect(reviews[0].rating).toBe(4); // 8.5/2 = 4.25, rounded to 4
  });

  it("handles Booking.com positive/negative columns", () => {
    const csv = `name,rating,positive,negative,date
Guest,9,Clean rooms,Noisy street,2024-01-01`;

    const { reviews } = parseReviewsCsv(csv, "booking_com");
    expect(reviews[0].body).toContain("Positive: Clean rooms");
    expect(reviews[0].body).toContain("Negative: Noisy street");
  });

  it("reports error for rows missing review text", () => {
    const csv = `name,rating,date
Guest,5,2024-01-01`;

    const { reviews, errors } = parseReviewsCsv(csv, "google");
    expect(reviews).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toContain("Missing review text");
  });

  it("maps alternative column names", () => {
    const csv = `author,score,comment,submitted
Guest,4,Nice place,2024-03-15`;

    const { reviews } = parseReviewsCsv(csv, "google");
    expect(reviews).toHaveLength(1);
    expect(reviews[0].reviewer_name).toBe("Guest");
    expect(reviews[0].rating).toBe(4);
    expect(reviews[0].body).toBe("Nice place");
  });

  it("defaults to Anonymous for missing reviewer name", () => {
    const csv = `body,rating,date
Great,5,2024-01-01`;

    const { reviews } = parseReviewsCsv(csv, "google");
    expect(reviews[0].reviewer_name).toBe("Anonymous");
  });

  it("clamps ratings to 1-5 range", () => {
    const csv = `name,rating,body,date
A,0,Bad,2024-01-01
B,10,Good,2024-01-01`;

    const { reviews } = parseReviewsCsv(csv, "google");
    expect(reviews[0].rating).toBe(1);
    expect(reviews[1].rating).toBe(5);
  });

  it("handles empty CSV", () => {
    const { reviews, errors } = parseReviewsCsv("", "google");
    expect(reviews).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("handles CSV with only headers", () => {
    const csv = `name,rating,body,date`;
    const { reviews, errors } = parseReviewsCsv(csv, "google");
    expect(reviews).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("preserves raw rating for reference", () => {
    const csv = `name,rating,body,date
Guest,8.5,Nice,2024-01-01`;

    const { reviews } = parseReviewsCsv(csv, "booking_com");
    expect(reviews[0].rating_raw).toBe("8.5");
  });
});
