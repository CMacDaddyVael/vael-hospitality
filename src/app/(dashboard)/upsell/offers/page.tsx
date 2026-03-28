import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UPSELL_CATEGORIES } from "@/lib/constants";
import { Plus, Package } from "lucide-react";
import Link from "next/link";

export default async function UpsellOffersPage() {
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
    .select("id")
    .eq("organization_id", membership!.organization_id)
    .is("deleted_at", null)
    .limit(1);

  const propertyId = properties?.[0]?.id;
  if (!propertyId) return <div>No property found.</div>;

  const { data: offers } = await supabase
    .from("upsell_offers")
    .select("*")
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("display_order");

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Upsell Offers</h1>
        <Link href="/upsell/offers/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Offer
          </Button>
        </Link>
      </div>

      {!offers?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700">No offers yet</h3>
            <p className="text-sm mt-1">
              Create room upgrades, breakfast packages, spa deals, and more.
            </p>
            <Link href="/upsell/offers/new">
              <Button className="mt-4" size="sm">Create First Offer</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const cat = UPSELL_CATEGORIES.find((c) => c.value === offer.category);
            return (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{offer.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {cat?.label ?? offer.category}
                        </Badge>
                        {!offer.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {offer.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{offer.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>
                          ${offer.price?.toFixed(0) ?? "0"} {offer.price_currency} ({offer.price_type})
                        </span>
                        <span>{(offer.commission_rate * 100).toFixed(0)}% commission</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
