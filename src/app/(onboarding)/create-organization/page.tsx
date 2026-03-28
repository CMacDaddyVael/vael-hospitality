"use client";

import { useActionState } from "react";
import { createOrganization } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateOrganizationPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await createOrganization(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Organization</CardTitle>
        <CardDescription>
          This is your hotel management company or brand name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Grand Hotels Group"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
