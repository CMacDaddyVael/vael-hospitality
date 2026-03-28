import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge>Trial</Badge>
          </CardTitle>
          <CardDescription>
            You&apos;re on the free trial with 100 AI credits per month.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-gray-500">
          Billing integration with Stripe coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
