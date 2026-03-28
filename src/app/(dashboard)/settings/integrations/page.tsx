import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Google Business Profile
                  <Badge variant="outline">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Connect to automatically sync reviews and publish responses
                </CardDescription>
              </div>
              <Button disabled>Connect</Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Auto-fetch reviews every 30 minutes and publish AI-generated responses directly to Google.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Booking.com</CardTitle>
                <CardDescription>Import reviews via CSV export</CardDescription>
              </div>
              <Badge variant="secondary">CSV Import</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Export reviews from your Booking.com extranet and import them using the CSV importer in the Reviews page.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>TripAdvisor</CardTitle>
                <CardDescription>Import reviews via CSV export</CardDescription>
              </div>
              <Badge variant="secondary">CSV Import</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Export reviews from your TripAdvisor management center and import them using the CSV importer.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
