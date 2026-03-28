import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractPreferences } from "@/lib/ai/extract-preferences";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { guestId } = await req.json();
  if (!guestId) return NextResponse.json({ error: "guestId is required" }, { status: 400 });

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 403 });

  const [guestRes, reviewsRes, reservationsRes] = await Promise.all([
    supabase.from("guests").select("*").eq("id", guestId).eq("organization_id", membership.organization_id).single(),
    supabase.from("reviews").select("*").eq("guest_id", guestId).is("deleted_at", null),
    supabase.from("reservations").select("*").eq("guest_id", guestId).is("deleted_at", null),
  ]);

  if (!guestRes.data) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  try {
    const analysis = await extractPreferences(
      guestRes.data,
      reviewsRes.data ?? [],
      reservationsRes.data ?? []
    );

    const { error } = await supabase
      .from("guests")
      .update({
        segment: analysis.segment,
        segment_confidence: analysis.segment_confidence,
        preferences: analysis.preferences,
        ai_summary: analysis.summary,
      })
      .eq("id", guestId);

    if (error) {
      console.error("[analyze-guest] DB update failed:", error);
    }

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze-guest] AI analysis failed:", err);
    return NextResponse.json(
      { error: "Failed to analyze guest preferences. Please try again." },
      { status: 502 }
    );
  }
}
