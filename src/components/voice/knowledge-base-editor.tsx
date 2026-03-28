"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VoiceKnowledgeEntry } from "@/lib/types";
import { createKBEntry, updateKBEntry, deleteKBEntry } from "@/actions/voice-knowledge-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, BookOpen } from "lucide-react";
import { KB_CATEGORIES } from "@/lib/voice/constants";
import { toast } from "sonner";

export function KnowledgeBaseEditor({
  propertyId,
  entries,
}: {
  propertyId: string;
  entries: VoiceKnowledgeEntry[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general_info");

  const grouped: Record<string, VoiceKnowledgeEntry[]> = {};
  for (const cat of KB_CATEGORIES) grouped[cat.value] = [];
  for (const entry of entries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }

  const handleCreate = async (category: string) => {
    const result = await createKBEntry(propertyId, {
      category,
      title: "New Entry",
      content: "",
    });
    if (result.error) toast.error(result.error);
    else {
      toast.success("Entry created");
      router.refresh();
    }
  };

  const handleUpdate = async (entryId: string, data: Partial<VoiceKnowledgeEntry>) => {
    const result = await updateKBEntry(entryId, data as Record<string, unknown>);
    if (result.error) toast.error(result.error);
    else toast.success("Saved");
  };

  const handleDelete = async (entryId: string) => {
    const result = await deleteKBEntry(entryId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Deleted");
      router.refresh();
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        {KB_CATEGORIES.map((cat) => (
          <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
            {cat.label}
            {grouped[cat.value]?.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs py-0 px-1">
                {grouped[cat.value].length}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {KB_CATEGORIES.map((cat) => (
        <TabsContent key={cat.value} value={cat.value} className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{getCategoryDescription(cat.value)}</p>
            <Button size="sm" onClick={() => handleCreate(cat.value)}>
              <Plus className="mr-1 h-4 w-4" /> Add {cat.label}
            </Button>
          </div>

          {grouped[cat.value]?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <BookOpen className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                <p>No {cat.label.toLowerCase()} entries yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {grouped[cat.value].map((entry) => (
                <KBEntryCard
                  key={entry.id}
                  entry={entry}
                  onSave={(data) => handleUpdate(entry.id, data)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function KBEntryCard({
  entry,
  onSave,
  onDelete,
}: {
  entry: VoiceKnowledgeEntry;
  onSave: (data: Partial<VoiceKnowledgeEntry>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [dirty, setDirty] = useState(false);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            className="font-medium"
            placeholder="Title"
          />
          <div className="flex gap-1 shrink-0">
            {dirty && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { onSave({ title, content, category: entry.category }); setDirty(false); }}
              >
                <Save className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setDirty(true); }}
          placeholder="Describe this in natural language for the AI..."
          rows={3}
          className="text-sm"
        />
      </CardContent>
    </Card>
  );
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    general_info: "Check-in/out times, WiFi, parking, and other basic hotel information.",
    room_type: "Room types with rates, capacity, amenities, and descriptions.",
    restaurant: "On-site restaurants and bars with hours, cuisine, and dress code.",
    menu_item: "Popular menu items with prices and dietary information.",
    spa_service: "Spa treatments and wellness services with pricing.",
    policy: "Cancellation, deposit, and other hotel policies.",
    faq: "Common questions and their answers.",
    local_attraction: "Nearby attractions, directions, and transport options.",
    staff_contact: "Department contacts and extension numbers for call transfers.",
    amenity: "Hotel amenities and facilities.",
    custom: "Any other information the AI should know.",
  };
  return descriptions[category] ?? "";
}
