import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">Analytics Dashboard</h3>
          <p className="text-sm text-gray-500 mt-1">
            Sentiment trends, topic frequency, rating distribution, and more. Coming in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
