import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { format } from "date-fns";

export default async function CampaignsPage() {
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

  const { data: sends } = propertyId
    ? await supabase
        .from("upsell_sends")
        .select("*, guests(first_name, last_name), reservations(check_in, check_out)")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const statusColors: Record<string, string> = {
    pending: "outline",
    sent: "secondary",
    delivered: "secondary",
    opened: "default",
    clicked: "default",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upsell Campaigns</h1>

      {!sends?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Send className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700">No campaigns sent yet</h3>
            <p className="text-sm mt-1">
              Campaigns are automatically generated for upcoming reservations, or you can send them manually from a guest profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sends.map((send: Record<string, unknown>) => (
            <Card key={send.id as string}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {String((send.guests as Record<string, unknown>)?.first_name ?? "")}{" "}
                      {String((send.guests as Record<string, unknown>)?.last_name ?? "")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {send.subject as string}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(send.created_at as string), "MMM d, yyyy")}
                      {" - "}
                      {(send.offer_ids as string[])?.length} offer{(send.offer_ids as string[])?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={(statusColors[send.status as string] ?? "outline") as "outline" | "secondary" | "default"}>
                      {send.status as string}
                    </Badge>
                    {(send.total_revenue as number) > 0 && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        +${(send.total_revenue as number).toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
