import { describe, it, expect } from "vitest";

describe("Auth callback redirect validation", () => {
  function validateNext(rawNext: string): string {
    return rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("@")
      ? rawNext
      : "/reviews";
  }

  it("allows normal paths", () => {
    expect(validateNext("/reviews")).toBe("/reviews");
    expect(validateNext("/settings/brand-voice")).toBe("/settings/brand-voice");
    expect(validateNext("/guests/abc-123")).toBe("/guests/abc-123");
  });

  it("blocks protocol-relative URLs", () => {
    expect(validateNext("//evil.com")).toBe("/reviews");
    expect(validateNext("//evil.com/steal")).toBe("/reviews");
  });

  it("blocks @ in path (host confusion)", () => {
    expect(validateNext("/@evil.com")).toBe("/reviews");
    expect(validateNext("/foo@bar")).toBe("/reviews");
  });

  it("blocks non-slash-prefixed paths", () => {
    expect(validateNext("evil.com")).toBe("/reviews");
    expect(validateNext("javascript:alert(1)")).toBe("/reviews");
    expect(validateNext("")).toBe("/reviews");
  });

  it("allows paths with query parameters", () => {
    expect(validateNext("/reviews?status=pending")).toBe("/reviews?status=pending");
  });
});
