import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseReviewsCsv } from "@/lib/import/csv-parser";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const platform = formData.get("platform") as string;
  const propertyId = formData.get("propertyId") as string;

  if (!file || !platform || !propertyId) {
    return NextResponse.json(
      { error: "Missing file, platform, or propertyId" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum 10MB." },
      { status: 413 }
    );
  }

  // Verify user owns this property
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("organization_id")
    .eq("id", propertyId)
    .eq("organization_id", membership.organization_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const csvText = await file.text();
  const { reviews: parsedReviews, errors: parseErrors } = parseReviewsCsv(
    csvText,
    platform
  );

  // Create import batch
  const { data: batch } = await supabase
    .from("import_batches")
    .insert({
      property_id: propertyId,
      organization_id: property.organization_id,
      uploaded_by: user.id,
      platform,
      filename: file.name,
      total_rows: parsedReviews.length + parseErrors.length,
    })
    .select()
    .single();

  let imported = 0;
  let skipped = 0;
  const newReviewIds: string[] = [];

  // Insert reviews in batches
  for (const parsed of parsedReviews) {
    const { data: inserted, error } = await supabase
      .from("reviews")
      .insert({
        property_id: propertyId,
        organization_id: property.organization_id,
        platform,
        reviewer_name: parsed.reviewer_name,
        rating: parsed.rating,
        rating_raw: parsed.rating_raw,
        title: parsed.title,
        body: parsed.body,
        review_date: parsed.review_date,
        import_batch_id: batch?.id,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        skipped++;
      }
    } else if (inserted) {
      imported++;
      newReviewIds.push(inserted.id);
    }
  }

  // Update batch status
  if (batch) {
    await supabase
      .from("import_batches")
      .update({
        status: "completed",
        imported_count: imported,
        skipped_count: skipped,
        error_count: parseErrors.length,
        errors: parseErrors,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batch.id);
  }

  // Trigger batch analysis for new reviews
  if (newReviewIds.length > 0) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/batch-analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ reviewIds: newReviewIds }),
    }).catch((err) => {
      console.error("[import] batch analysis trigger failed:", err);
    });
  }

  return NextResponse.json({
    total: parsedReviews.length + parseErrors.length,
    imported,
    skipped,
    errors: parseErrors.length,
  });
}
