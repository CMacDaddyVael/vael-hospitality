import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function AskPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ask Reviews Anything</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">AI-Powered Review Intelligence</h3>
          <p className="text-sm text-gray-500 mt-1">
            Chat with your review data to surface insights. Coming in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
