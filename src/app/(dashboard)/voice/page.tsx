import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function VoiceCallLogPage() {
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

  const { data: calls } = propertyId
    ? await supabase
        .from("voice_calls")
        .select("*")
        .eq("property_id", propertyId)
        .order("started_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const resolutionColors: Record<string, string> = {
    resolved: "bg-green-100 text-green-700",
    transferred: "bg-blue-100 text-blue-700",
    callback_needed: "bg-yellow-100 text-yellow-700",
    unresolved: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Voice Calls</h1>
        <Link href="/voice/analytics">
          <Badge variant="outline" className="cursor-pointer">View Analytics</Badge>
        </Link>
      </div>

      {!calls?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Phone className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700">No calls yet</h3>
            <p className="text-sm mt-1">
              Set up your voice agent in <Link href="/settings/voice" className="text-blue-600 underline">Settings</Link> and add knowledge in the <Link href="/settings/knowledge-base" className="text-blue-600 underline">Knowledge Base</Link>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {calls.map((call) => (
            <Link key={call.id} href={`/voice/${call.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">
                          {call.caller_phone ?? "Unknown caller"}
                          {call.caller_name && ` — ${call.caller_name}`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span>{format(new Date(call.started_at), "MMM d, h:mm a")}</span>
                          {call.duration_seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(call.duration_seconds / 60)}:{String(call.duration_seconds % 60).padStart(2, "0")}
                            </span>
                          )}
                          {call.detected_language && call.detected_language !== "en" && (
                            <Badge variant="outline" className="text-xs py-0">{call.detected_language}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(call.topics as string[])?.slice(0, 2).map((topic: string) => (
                        <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                      ))}
                      {call.resolution && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${resolutionColors[call.resolution] ?? "bg-gray-100 text-gray-600"}`}>
                          {call.resolution}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  {call.summary && (
                    <p className="text-xs text-gray-500 mt-2 ml-8 line-clamp-1">{call.summary}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
