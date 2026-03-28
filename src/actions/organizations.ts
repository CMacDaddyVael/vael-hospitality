"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { organizationSchema } from "@/lib/validations";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = organizationSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.name, slug })
    .select()
    .single();

  if (orgError) return { error: orgError.message };

  const { error: memberError } = await supabase.from("memberships").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
    accepted_at: new Date().toISOString(),
  });

  if (memberError) return { error: memberError.message };

  redirect("/add-property");
}
