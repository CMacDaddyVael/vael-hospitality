import { createClient } from "@/lib/supabase/server";
import { ReviewInbox } from "@/components/reviews/review-inbox";
import { cookies } from "next/headers";
import type { ReviewResponse } from "@/lib/types";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get first property for the user (simplified — context provider handles switching client-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership) return null;

  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .is("deleted_at", null)
    .limit(1);

  const propertyId = properties?.[0]?.id;
  if (!propertyId) return <div>No property found. Please add one.</div>;

  // Build query
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("review_date", { ascending: false })
    .limit(50);

  // Apply filters from URL params
  const platform = typeof params.platform === "string" && params.platform !== "all" ? params.platform : null;
  const rating = typeof params.rating === "string" && params.rating !== "all" ? params.rating : null;
  const sentiment = typeof params.sentiment === "string" && params.sentiment !== "all" ? params.sentiment : null;
  const status = typeof params.status === "string" && params.status !== "all" ? params.status : null;
  const search = typeof params.q === "string" ? params.q : null;

  if (platform) query = query.eq("platform", platform);
  if (rating) query = query.eq("rating", parseInt(rating));
  if (sentiment) query = query.eq("sentiment", sentiment);
  if (status) query = query.eq("response_status", status);
  if (search) query = query.textSearch("fts", search);

  const { data: reviews } = await query;

  // Fetch existing responses for these reviews
  const reviewIds = reviews?.map((r) => r.id) ?? [];
  const { data: responsesList } = reviewIds.length
    ? await supabase
        .from("review_responses")
        .select("*")
        .in("review_id", reviewIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Map responses by review_id (latest first)
  const responses: Record<string, ReviewResponse> = {};
  for (const resp of responsesList ?? []) {
    if (!responses[resp.review_id]) {
      responses[resp.review_id] = resp;
    }
  }

  return (
    <ReviewInbox
      reviews={reviews ?? []}
      responses={responses}
      propertyId={propertyId}
    />
  );
}
