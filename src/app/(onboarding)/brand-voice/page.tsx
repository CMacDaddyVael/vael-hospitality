"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, GREETING_STYLES, RESPONSE_LENGTHS } from "@/lib/constants";

export default function BrandVoicePage() {
  const router = useRouter();
  const [tone, setTone] = useState("professional_friendly");
  const [greeting, setGreeting] = useState("dear_guest");
  const [length, setLength] = useState("medium");
  const [signOff, setSignOff] = useState("Warm regards,\nThe Team");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Brand Voice</CardTitle>
        <CardDescription>
          Configure how AI responds to your reviews. You can refine this later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => v && setTone(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Greeting Style</Label>
          <Select value={greeting} onValueChange={(v) => v && setGreeting(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GREETING_STYLES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Response Length</Label>
          <Select value={length} onValueChange={(v) => v && setLength(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_LENGTHS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sign Off</Label>
          <Textarea
            value={signOff}
            onChange={(e) => setSignOff(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/reviews")}
          >
            Skip for Now
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push("/reviews")}
          >
            Save & Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
