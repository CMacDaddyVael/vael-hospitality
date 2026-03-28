import { createAdminClient } from "@/lib/supabase/admin";

type ToolContext = {
  propertyId: string;
  organizationId: string;
  callId: string;
  callerPhone?: string;
};

export async function executeVoiceTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const supabase = createAdminClient();

  switch (toolName) {
    case "check_availability": {
      const checkIn = toolInput.check_in as string;
      const checkOut = toolInput.check_out as string;
      const roomType = toolInput.room_type as string | undefined;

      // Get available room types from knowledge base
      const { data: rooms } = await supabase
        .from("voice_knowledge_base")
        .select("title, structured_data")
        .eq("property_id", context.propertyId)
        .eq("category", "room_type")
        .eq("is_active", true)
        .is("deleted_at", null);

      // Check existing reservations for conflicts
      const { data: conflicts } = await supabase
        .from("reservations")
        .select("room_type")
        .eq("property_id", context.propertyId)
        .lt("check_in", checkOut)
        .gt("check_out", checkIn)
        .in("status", ["confirmed", "checked_in"]);

      const bookedTypes = new Set((conflicts ?? []).map((c) => c.room_type));
      const available = (rooms ?? []).filter(
        (r) => !roomType || r.title.toLowerCase().includes(roomType.toLowerCase())
      );

      if (available.length === 0) {
        return `No rooms found matching "${roomType ?? "any type"}" for ${checkIn} to ${checkOut}.`;
      }

      return `Available rooms for ${checkIn} to ${checkOut}:\n${available.map((r) => {
        const d = r.structured_data as Record<string, unknown>;
        return `- ${r.title}: ${d.rate_low ?? "?"}–${d.rate_high ?? "?"} ${d.rate_currency ?? "USD"}/night`;
      }).join("\n")}`;
    }

    case "make_reservation": {
      const checkIn = toolInput.check_in as string;
      const checkOut = toolInput.check_out as string;

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return "I need valid check-in and check-out dates. Could you please repeat those?";
      }
      if (checkOutDate <= checkInDate) {
        return "The check-out date must be after the check-in date. Could you please confirm the dates?";
      }

      // Create or find guest
      let guestId: string;
      const { data: existingGuest } = await supabase
        .from("guests")
        .select("id")
        .eq("property_id", context.propertyId)
        .eq("first_name", toolInput.guest_first_name)
        .eq("last_name", toolInput.guest_last_name)
        .is("deleted_at", null)
        .limit(1)
        .single();

      if (existingGuest) {
        guestId = existingGuest.id;
      } else {
        const { data: newGuest, error: guestError } = await supabase
          .from("guests")
          .insert({
            property_id: context.propertyId,
            organization_id: context.organizationId,
            first_name: toolInput.guest_first_name as string,
            last_name: toolInput.guest_last_name as string,
            email: (toolInput.guest_email as string) || null,
            phone: (toolInput.guest_phone as string) || context.callerPhone || null,
          })
          .select("id")
          .single();
        if (guestError || !newGuest) {
          console.error("[make_reservation] Failed to create guest:", guestError);
          return "I'm sorry, I wasn't able to set up the guest profile. Please try again or speak with our front desk.";
        }
        guestId = newGuest.id;
      }

      const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
          guest_id: guestId,
          property_id: context.propertyId,
          organization_id: context.organizationId,
          check_in: checkIn,
          check_out: checkOut,
          room_type: toolInput.room_type as string,
          adults: (toolInput.adults as number) ?? 1,
          children: (toolInput.children as number) ?? 0,
          special_requests: (toolInput.special_requests as string) || null,
          source: "phone",
          status: "confirmed",
        })
        .select("id")
        .single();

      if (error || !reservation) {
        console.error("[make_reservation] DB error:", error);
        return "I'm sorry, I wasn't able to complete the reservation. Please try again or speak with our front desk.";
      }
      return `Reservation confirmed! Confirmation number: ${reservation.id.slice(0, 8).toUpperCase()}. ${toolInput.room_type} room from ${checkIn} to ${checkOut} for ${toolInput.guest_first_name} ${toolInput.guest_last_name}.`;
    }

    case "lookup_reservation": {
      const confNum = toolInput.confirmation_number as string;
      const guestName = toolInput.guest_name as string;

      let query = supabase
        .from("reservations")
        .select("*, guests(first_name, last_name)")
        .eq("property_id", context.propertyId)
        .is("deleted_at", null);

      if (confNum) {
        query = query.ilike("id", `${confNum.toLowerCase()}%`);
      }

      const { data: reservations } = await query.limit(5);

      if (!reservations?.length) return "No reservation found with those details.";

      const filtered = guestName
        ? reservations.filter((r) => {
            const g = r.guests as Record<string, unknown>;
            const name = `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.toLowerCase();
            return name.includes(guestName.toLowerCase());
          })
        : reservations;

      if (!filtered.length) return "No reservation found matching that name.";

      const r = filtered[0];
      const g = r.guests as Record<string, unknown>;
      return `Found reservation: ${g?.first_name} ${g?.last_name}, ${r.room_type ?? "standard"} room, ${r.check_in} to ${r.check_out}, status: ${r.status}.`;
    }

    case "transfer_call": {
      return `__TRANSFER__:${toolInput.department as string}`;
    }

    case "lookup_guest": {
      const name = toolInput.name as string;
      const phone = toolInput.phone as string;

      let query = supabase
        .from("guests")
        .select("first_name, last_name, email, total_stays, segment")
        .eq("property_id", context.propertyId)
        .is("deleted_at", null);

      if (phone) query = query.eq("phone", phone);

      const { data: guests } = await query.limit(5);

      if (!guests?.length) return "No guest found with those details.";

      const filtered = name
        ? guests.filter((g) =>
            `${g.first_name} ${g.last_name}`.toLowerCase().includes(name.toLowerCase())
          )
        : guests;

      if (!filtered.length) return "No guest found matching that name.";
      const g = filtered[0];
      return `Found guest: ${g.first_name} ${g.last_name} (${g.email ?? "no email"}), ${g.total_stays} previous stays, segment: ${g.segment ?? "unknown"}.`;
    }

    default:
      return `Action "${toolName}" is not available.`;
  }
}
