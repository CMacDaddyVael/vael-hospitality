import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function VoiceAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Voice Analytics</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">Voice Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">
            Call volume, resolution rates, top topics, language distribution, and cost tracking will appear here as calls come in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
