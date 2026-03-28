import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all active properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .is("deleted_at", null);

  if (!properties?.length) {
    return NextResponse.json({ refreshed: 0 });
  }

  const today = new Date().toISOString().split("T")[0];
  let refreshed = 0;

  for (const property of properties) {
    try {
      await supabase.rpc("refresh_daily_analytics", {
        p_property_id: property.id,
        p_date: today,
      });
      refreshed++;
    } catch (err) {
      console.error(`[refresh-analytics] Failed for property ${property.id}:`, err);
    }
  }

  return NextResponse.json({ refreshed });
}
