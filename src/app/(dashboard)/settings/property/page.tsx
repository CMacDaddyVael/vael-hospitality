import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PropertySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", membership!.organization_id)
    .is("deleted_at", null);

  const property = properties?.[0];
  if (!property) return <div>No property found.</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Property Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>{property.name}</CardTitle>
          <CardDescription>
            {property.property_type} {property.city && `in ${property.city}`}{property.country && `, ${property.country}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-gray-500">Star Rating:</span> {property.star_rating ?? "Not set"}</div>
          <div><span className="text-gray-500">Website:</span> {property.website ?? "Not set"}</div>
          <div><span className="text-gray-500">Phone:</span> {property.phone ?? "Not set"}</div>
          <div><span className="text-gray-500">Google Place ID:</span> {property.google_place_id ?? "Not connected"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
