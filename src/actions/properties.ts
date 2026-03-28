"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { propertySchema } from "@/lib/validations";

async function getUserOrg() {
  const supabase = await createClient();
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

  return membership ? { user, organizationId: membership.organization_id } : null;
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = propertySchema.safeParse({
    name: formData.get("name"),
    property_type: formData.get("property_type") || "hotel",
    city: formData.get("city"),
    country: formData.get("country"),
    star_rating: formData.get("star_rating") || undefined,
    website: formData.get("website"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      organization_id: ctx.organizationId,
      name: parsed.data.name,
      slug,
      property_type: parsed.data.property_type,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      star_rating: parsed.data.star_rating || null,
      website: parsed.data.website || null,
      phone: parsed.data.phone || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Create a default brand voice
  await supabase.from("brand_voices").insert({
    property_id: property.id,
    organization_id: ctx.organizationId,
    name: "Default",
    is_active: true,
    tone: "professional_friendly",
  });

  redirect("/brand-voice");
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const ctx = await getUserOrg();
  if (!ctx) return { error: "Not authenticated" };

  const parsed = propertySchema.safeParse({
    name: formData.get("name"),
    property_type: formData.get("property_type"),
    city: formData.get("city"),
    country: formData.get("country"),
    star_rating: formData.get("star_rating") || undefined,
    website: formData.get("website"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("properties")
    .update({
      name: parsed.data.name,
      property_type: parsed.data.property_type,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      star_rating: parsed.data.star_rating || null,
      website: parsed.data.website || null,
      phone: parsed.data.phone || null,
    })
    .eq("id", propertyId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };
  return { success: true };
}
