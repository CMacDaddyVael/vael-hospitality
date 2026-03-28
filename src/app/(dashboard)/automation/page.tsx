import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function AutomationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Automation</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">Automation Rules</h3>
          <p className="text-sm text-gray-500 mt-1">
            Auto-respond to reviews, flag negative feedback, assign to team members. Coming in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
