import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdapter } from "@/lib/pms/registry";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await req.text();

  const supabase = createAdminClient();

  // Find connection for this provider
  const { data: connections } = await supabase
    .from("pms_connections")
    .select("*")
    .eq("provider", provider)
    .eq("status", "connected")
    .is("deleted_at", null);

  if (!connections?.length) {
    return NextResponse.json({ error: "No connection found" }, { status: 404 });
  }

  // Try to parse with each connection's adapter
  for (const conn of connections) {
    try {
      const adapter = getAdapter(provider, conn.credentials as Record<string, unknown>);
      const event = adapter.parseWebhookEvent(req.headers, body);

      if (event) {
        // Create timeline event
        // In a full implementation, we'd also trigger sync for the specific guest/reservation
        await supabase.from("guest_timeline_events").insert({
          guest_id: null as unknown as string, // Would need to resolve from external ID
          property_id: conn.property_id,
          organization_id: conn.organization_id,
          event_type: event.type,
          title: `PMS Event: ${event.type}`,
          description: JSON.stringify(event.data).slice(0, 500),
          metadata: { pms_event: event },
        });
      }
    } catch {
      // Continue trying other connections
    }
  }

  return NextResponse.json({ received: true });
}
