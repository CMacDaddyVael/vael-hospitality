import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function RevenuePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Revenue Tracking</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">Revenue Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">
            Revenue by month, by offer category, and commission tracking will appear here once upsell campaigns start generating revenue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
