import { createAdminClient } from "@/lib/supabase/admin";
import { getAdapter } from "./registry";
import type { PMSGuest, PMSReservation } from "./types";

export async function syncPMSConnection(connectionId: string) {
  const supabase = createAdminClient();

  const { data: connection } = await supabase
    .from("pms_connections")
    .select("*")
    .eq("id", connectionId)
    .single();

  if (!connection || connection.status !== "connected") return { synced: 0 };

  const adapter = getAdapter(connection.provider, connection.credentials as Record<string, unknown>);
  const cursor = (connection.sync_cursor ?? {}) as Record<string, unknown>;

  let guestsSynced = 0;
  let reservationsSynced = 0;

  try {
    // Sync guests
    const guestResult = await adapter.fetchGuests(cursor);
    for (const pmsGuest of guestResult.guests) {
      await upsertGuest(supabase, connection, pmsGuest);
      guestsSynced++;
    }

    // Sync reservations
    const resResult = await adapter.fetchReservations(cursor);
    for (const pmsRes of resResult.reservations) {
      await upsertReservation(supabase, connection, pmsRes);
      reservationsSynced++;
    }

    // Update sync cursor
    await supabase
      .from("pms_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        sync_cursor: {
          ...cursor,
          ...guestResult.nextCursor,
          ...resResult.nextCursor,
        },
        last_sync_error: null,
      })
      .eq("id", connectionId);
  } catch (err) {
    await supabase
      .from("pms_connections")
      .update({
        last_sync_error: String(err),
        last_sync_error_at: new Date().toISOString(),
      })
      .eq("id", connectionId);
  }

  return { guestsSynced, reservationsSynced };
}

async function upsertGuest(
  supabase: ReturnType<typeof createAdminClient>,
  connection: Record<string, unknown>,
  pmsGuest: PMSGuest
) {
  const propertyId = connection.property_id as string;
  const orgId = connection.organization_id as string;
  const connId = connection.id as string;

  // Check if guest exists
  const { data: existing } = await supabase
    .from("guests")
    .select("id")
    .eq("property_id", propertyId)
    .eq("pms_connection_id", connId)
    .eq("pms_guest_id", pmsGuest.externalId)
    .is("deleted_at", null)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("guests")
      .update({
        first_name: pmsGuest.firstName,
        last_name: pmsGuest.lastName,
        email: pmsGuest.email,
        phone: pmsGuest.phone,
        nationality: pmsGuest.nationality,
        language: pmsGuest.language,
      })
      .eq("id", existing.id);
    if (error) console.error("[sync] Failed to update guest:", pmsGuest.externalId, error.message);
  } else {
    const { error } = await supabase.from("guests").insert({
      property_id: propertyId,
      organization_id: orgId,
      pms_connection_id: connId,
      pms_guest_id: pmsGuest.externalId,
      first_name: pmsGuest.firstName,
      last_name: pmsGuest.lastName,
      email: pmsGuest.email,
      phone: pmsGuest.phone,
      nationality: pmsGuest.nationality,
      language: pmsGuest.language,
    });
    if (error) console.error("[sync] Failed to insert guest:", pmsGuest.externalId, error.message);
  }
}

async function upsertReservation(
  supabase: ReturnType<typeof createAdminClient>,
  connection: Record<string, unknown>,
  pmsRes: PMSReservation
) {
  const propertyId = connection.property_id as string;
  const orgId = connection.organization_id as string;
  const connId = connection.id as string;

  // Find the guest by PMS ID
  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("property_id", propertyId)
    .eq("pms_connection_id", connId)
    .eq("pms_guest_id", pmsRes.guestExternalId)
    .is("deleted_at", null)
    .single();

  if (!guest) return; // Guest not synced yet

  const { data: existing } = await supabase
    .from("reservations")
    .select("id")
    .eq("property_id", propertyId)
    .eq("pms_connection_id", connId)
    .eq("pms_reservation_id", pmsRes.externalId)
    .is("deleted_at", null)
    .single();

  const resData = {
    status: pmsRes.status,
    check_in: pmsRes.checkIn,
    check_out: pmsRes.checkOut,
    room_type: pmsRes.roomType,
    room_number: pmsRes.roomNumber,
    rate_amount: pmsRes.rateAmount,
    rate_currency: pmsRes.rateCurrency,
    total_amount: pmsRes.totalAmount,
    adults: pmsRes.adults,
    children: pmsRes.children,
    source: pmsRes.source,
    special_requests: pmsRes.specialRequests,
  };

  if (existing) {
    await supabase.from("reservations").update(resData).eq("id", existing.id);
  } else {
    await supabase.from("reservations").insert({
      guest_id: guest.id,
      property_id: propertyId,
      organization_id: orgId,
      pms_connection_id: connId,
      pms_reservation_id: pmsRes.externalId,
      ...resData,
    });
  }
}
