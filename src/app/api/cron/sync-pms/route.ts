import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncPMSConnection } from "@/lib/pms/sync-engine";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: connections } = await supabase
    .from("pms_connections")
    .select("id")
    .eq("status", "connected")
    .is("deleted_at", null);

  if (!connections?.length) {
    return NextResponse.json({ synced: 0 });
  }

  let totalGuests = 0;
  let totalReservations = 0;

  for (const conn of connections) {
    try {
      const result = await syncPMSConnection(conn.id);
      totalGuests += result.guestsSynced ?? 0;
      totalReservations += result.reservationsSynced ?? 0;
    } catch (err) {
      console.error(`[sync-pms] Failed for connection ${conn.id}:`, err);
    }
  }

  return NextResponse.json({
    connections: connections.length,
    guestsSynced: totalGuests,
    reservationsSynced: totalReservations,
  });
}
