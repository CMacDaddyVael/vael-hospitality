import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Globe, MessageSquare, Wrench } from "lucide-react";
import { format } from "date-fns";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;
  const supabase = await createClient();

  const { data: call } = await supabase
    .from("voice_calls")
    .select("*")
    .eq("id", callId)
    .single();

  if (!call) notFound();

  const { data: messages } = await supabase
    .from("voice_call_messages")
    .select("*")
    .eq("call_id", callId)
    .order("created_at");

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Call Detail</h1>
        <Badge variant="outline" className="capitalize">{call.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Phone className="h-4 w-4" /> Caller
            </div>
            <p className="font-medium">{call.caller_phone ?? "Unknown"}</p>
            {call.caller_name && <p className="text-sm text-gray-500">{call.caller_name}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Clock className="h-4 w-4" /> Duration
            </div>
            <p className="font-medium">
              {call.duration_seconds
                ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                : "In progress"}
            </p>
            <p className="text-xs text-gray-400">{format(new Date(call.started_at), "MMM d, yyyy h:mm a")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Globe className="h-4 w-4" /> Language
            </div>
            <p className="font-medium">{call.detected_language ?? "en"}</p>
            {call.sentiment && <Badge variant="outline" className="mt-1 capitalize">{call.sentiment}</Badge>}
          </CardContent>
        </Card>
      </div>

      {call.summary && (
        <Card className="mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-sm">AI Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{call.summary}</p>
            {(call.topics as string[])?.length > 0 && (
              <div className="flex gap-1 mt-2">
                {(call.topics as string[]).map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Transcript</CardTitle></CardHeader>
        <CardContent>
          {!messages?.length ? (
            <p className="text-sm text-gray-500">No transcript available.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "caller" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      msg.role === "caller"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-50 text-blue-900"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {msg.role === "caller" ? "Caller" : "AI Agent"}
                      {msg.latency_ms && (
                        <span className="ml-2 text-gray-400">{msg.latency_ms}ms</span>
                      )}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                    {msg.tool_calls && (msg.tool_calls as Array<Record<string, unknown>>).length > 0 && (
                      <div className="mt-2 border-t pt-2">
                        {(msg.tool_calls as Array<Record<string, unknown>>).map((tool, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                            <Wrench className="h-3 w-3" />
                            <span className="font-mono">{String(tool.name)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
