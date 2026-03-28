"use client";

import { useState } from "react";
import { upsertVoiceConfig, toggleVoiceEnabled } from "@/actions/voice-config";
import type { VoiceConfiguration } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function VoiceSettingsForm({
  propertyId,
  initialData,
}: {
  propertyId: string;
  initialData: VoiceConfiguration | null;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialData?.is_enabled ?? false);
  const [greeting, setGreeting] = useState(initialData?.greeting_message ?? "Thank you for calling. How may I assist you today?");
  const [afterHours, setAfterHours] = useState(initialData?.after_hours_message ?? "");
  const [forwarding, setForwarding] = useState(initialData?.forwarding_number ?? "");
  const [voiceId, setVoiceId] = useState(initialData?.voice_id ?? "Polly.Joanna");
  const [language, setLanguage] = useState(initialData?.primary_language ?? "en-US");
  const [maxDuration, setMaxDuration] = useState(String(initialData?.max_call_duration_seconds ?? 600));
  const [recording, setRecording] = useState(initialData?.enable_call_recording ?? true);
  const [departments, setDepartments] = useState(
    initialData?.transfer_departments ?? []
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    await toggleVoiceEnabled(propertyId, value);
    toast.success(value ? "Voice agent enabled" : "Voice agent disabled");
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await upsertVoiceConfig(propertyId, {
      greeting_message: greeting,
      after_hours_message: afterHours || undefined,
      forwarding_number: forwarding || undefined,
      voice_id: voiceId,
      primary_language: language,
      max_call_duration_seconds: parseInt(maxDuration),
      enable_call_recording: recording,
      transfer_departments: departments.filter((d) => d.name && d.number),
    });
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Voice settings saved");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" /> Voice Agent
            </CardTitle>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-500">
          {initialData?.twilio_phone_number ? (
            <p>Phone: <span className="font-mono font-medium text-gray-900">{initialData.twilio_phone_number}</span></p>
          ) : (
            <p>No phone number provisioned yet. Contact support to set up your number.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Greeting & Messages</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Greeting Message</Label>
            <Textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>After Hours Message (optional)</Label>
            <Textarea value={afterHours} onChange={(e) => setAfterHours(e.target.value)} rows={2} placeholder="Leave empty to use same greeting 24/7" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Voice & Language</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Input value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="Polly.Joanna" />
            </div>
            <div className="space-y-2">
              <Label>Primary Language</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en-US" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Call Duration (seconds)</Label>
              <Input type="number" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={recording} onCheckedChange={setRecording} />
              <Label>Enable call recording</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfer Departments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setDepartments([...departments, { name: "", number: "" }])}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <p className="text-sm text-gray-500">Add departments the AI can transfer calls to.</p>
          ) : (
            <div className="space-y-3">
              {departments.map((dept, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Department name"
                    value={dept.name}
                    onChange={(e) => {
                      const updated = [...departments];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setDepartments(updated);
                    }}
                  />
                  <Input
                    placeholder="Phone number"
                    value={dept.number}
                    onChange={(e) => {
                      const updated = [...departments];
                      updated[i] = { ...updated[i], number: e.target.value };
                      setDepartments(updated);
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setDepartments(departments.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="space-y-2">
          <Label>Fallback Transfer Number</Label>
          <Input value={forwarding} onChange={(e) => setForwarding(e.target.value)} placeholder="+1..." />
          <p className="text-xs text-gray-400">Default number when no specific department matches.</p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Voice Settings
      </Button>
    </div>
  );
}
