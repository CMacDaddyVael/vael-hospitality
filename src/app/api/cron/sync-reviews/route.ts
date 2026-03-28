import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Implement Google Business Profile review sync
  // 1. Fetch all connected Google review sources
  // 2. For each, refresh tokens if needed
  // 3. Fetch new reviews from Google API
  // 4. Insert new reviews, skip duplicates
  // 5. Queue for AI analysis

  return NextResponse.json({ synced: 0, message: "Google sync not yet implemented" });
}
