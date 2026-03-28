"use client";

import { useState } from "react";
import { upsertBrandVoice } from "@/actions/brand-voice";
import type { BrandVoice, PropertyFact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONE_OPTIONS, GREETING_STYLES, RESPONSE_LENGTHS } from "@/lib/constants";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BrandVoiceForm({
  propertyId,
  initialData,
}: {
  propertyId: string;
  initialData: BrandVoice | null;
}) {
  const [tone, setTone] = useState(initialData?.tone ?? "professional_friendly");
  const [greeting, setGreeting] = useState(initialData?.greeting_style ?? "dear_guest");
  const [length, setLength] = useState(initialData?.response_length ?? "medium");
  const [language, setLanguage] = useState(initialData?.language ?? "en");
  const [signOff, setSignOff] = useState(initialData?.sign_off ?? "Warm regards,\nThe Team");
  const [customInstructions, setCustomInstructions] = useState(initialData?.custom_instructions ?? "");
  const [facts, setFacts] = useState<PropertyFact[]>(
    (initialData?.property_facts as PropertyFact[]) ?? []
  );
  const [saving, setSaving] = useState(false);

  const addFact = () => setFacts([...facts, { category: "", fact: "" }]);
  const removeFact = (i: number) => setFacts(facts.filter((_, idx) => idx !== i));
  const updateFact = (i: number, field: keyof PropertyFact, value: string) => {
    const updated = [...facts];
    updated[i] = { ...updated[i], [field]: value };
    setFacts(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await upsertBrandVoice(propertyId, {
      tone,
      greeting_style: greeting,
      response_length: length,
      language,
      sign_off: signOff,
      custom_instructions: customInstructions || undefined,
      property_facts: facts.filter((f) => f.fact.trim()),
    });
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success("Brand voice saved");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tone & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Response Length</Label>
              <Select value={length} onValueChange={(v) => v && setLength(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESPONSE_LENGTHS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Greeting Style</Label>
              <Select value={greeting} onValueChange={(v) => v && setGreeting(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GREETING_STYLES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sign Off</Label>
            <Textarea value={signOff} onChange={(e) => setSignOff(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any special instructions for how AI should respond..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Facts</CardTitle>
            <Button variant="outline" size="sm" onClick={addFact}>
              <Plus className="mr-1 h-4 w-4" /> Add Fact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {facts.length === 0 ? (
            <p className="text-sm text-gray-500">
              Add facts about your property (renovations, amenities, policies) so the AI can reference them in responses.
            </p>
          ) : (
            <div className="space-y-3">
              {facts.map((fact, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    placeholder="Category (e.g., amenity)"
                    value={fact.category}
                    onChange={(e) => updateFact(i, "category", e.target.value)}
                    className="w-[150px]"
                  />
                  <Input
                    placeholder="Fact (e.g., Free airport shuttle every 30 min)"
                    value={fact.fact}
                    onChange={(e) => updateFact(i, "fact", e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeFact(i)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Brand Voice
      </Button>
    </div>
  );
}
