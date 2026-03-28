import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Send, MousePointerClick, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function UpsellDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  // Get stats
  const { count: totalSends } = propertyId
    ? await supabase.from("upsell_sends").select("*", { count: "exact", head: true }).eq("property_id", propertyId)
    : { count: 0 };

  const { count: activeOffers } = propertyId
    ? await supabase.from("upsell_offers").select("*", { count: "exact", head: true }).eq("property_id", propertyId).eq("is_active", true).is("deleted_at", null)
    : { count: 0 };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Upsell Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/upsell/offers">
            <Button variant="outline" size="sm">Manage Offers</Button>
          </Link>
          <Link href="/upsell/campaigns">
            <Button size="sm">Campaigns</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" /> Revenue
            </div>
            <p className="text-2xl font-bold">$0</p>
            <p className="text-xs text-gray-400">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Send className="h-4 w-4" /> Campaigns Sent
            </div>
            <p className="text-2xl font-bold">{totalSends ?? 0}</p>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <MousePointerClick className="h-4 w-4" /> Acceptance Rate
            </div>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-gray-400">No data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <TrendingUp className="h-4 w-4" /> Active Offers
            </div>
            <p className="text-2xl font-bold">{activeOffers ?? 0}</p>
            <p className="text-xs text-gray-400">In library</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>1. <Link href="/upsell/offers/new" className="text-blue-600 underline">Create upsell offers</Link> — room upgrades, breakfast, spa packages, etc.</p>
          <p>2. <Link href="/settings/integrations" className="text-blue-600 underline">Connect your PMS</Link> — to automatically pull guest profiles and reservations.</p>
          <p>3. AI will match the best offers to each guest and generate personalized pre-arrival emails.</p>
          <p>4. Track revenue, acceptance rates, and commission in the dashboard.</p>
        </CardContent>
      </Card>
    </div>
  );
}
