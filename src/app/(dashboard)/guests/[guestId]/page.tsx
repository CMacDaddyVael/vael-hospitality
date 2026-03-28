import { createClient } from "@/lib/supabase/server";
import { GuestProfile } from "@/components/guests/guest-profile";
import { notFound } from "next/navigation";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ guestId: string }>;
}) {
  const { guestId } = await params;
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .is("deleted_at", null)
    .single();

  if (!guest) notFound();

  const [reservationsRes, reviewsRes, timelineRes] = await Promise.all([
    supabase
      .from("reservations")
      .select("*")
      .eq("guest_id", guestId)
      .is("deleted_at", null)
      .order("check_in", { ascending: false }),
    supabase
      .from("reviews")
      .select("*")
      .eq("guest_id", guestId)
      .is("deleted_at", null)
      .order("review_date", { ascending: false }),
    supabase
      .from("guest_timeline_events")
      .select("*")
      .eq("guest_id", guestId)
      .order("event_date", { ascending: false })
      .limit(50),
  ]);

  return (
    <GuestProfile
      guest={guest}
      reservations={reservationsRes.data ?? []}
      reviews={reviewsRes.data ?? []}
      timeline={timelineRes.data ?? []}
    />
  );
}
