"use client";

import { useState } from "react";
import type { SmartSnippet } from "@/lib/types";
import { createSnippet, deleteSnippet } from "@/actions/smart-snippets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { REVIEW_TOPICS, SENTIMENT_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SnippetList({
  propertyId,
  snippets,
}: {
  propertyId: string;
  snippets: SmartSnippet[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [sentiment, setSentiment] = useState("any");
  const [talkingPoints, setTalkingPoints] = useState("");

  const handleCreate = async () => {
    const result = await createSnippet(propertyId, {
      topic,
      topic_keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      sentiment,
      talking_points: talkingPoints.split("\n").map((t) => t.trim()).filter(Boolean),
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Snippet created");
      setOpen(false);
      setTopic("");
      setKeywords("");
      setTalkingPoints("");
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSnippet(id);
    toast.success("Snippet deleted");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Smart Snippets teach the AI how to handle specific topics in reviews.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-3 hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Snippet
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Smart Snippet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Select value={topic} onValueChange={(v) => v && setTopic(v)}>
                  <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                  <SelectContent>
                    {REVIEW_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trigger Keywords (comma-separated)</Label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="parking, car park, garage, valet"
                />
              </div>
              <div className="space-y-2">
                <Label>Sentiment Filter</Label>
                <Select value={sentiment} onValueChange={(v) => v && setSentiment(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {SENTIMENT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Talking Points (one per line)</Label>
                <textarea
                  value={talkingPoints}
                  onChange={(e) => setTalkingPoints(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={"We offer complimentary underground parking\nValet parking available for $25/night"}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Snippet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {snippets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <MessageSquare className="mx-auto h-8 w-8 mb-2" />
            <p>No smart snippets yet.</p>
            <p className="text-sm">Add snippets to teach the AI about your property&apos;s specific talking points.</p>
          </CardContent>
        </Card>
      ) : (
        snippets.map((snippet) => (
          <Card key={snippet.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base capitalize">{snippet.topic}</CardTitle>
                  <Badge variant="outline" className="text-xs">{snippet.sentiment}</Badge>
                  {!snippet.is_active && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(snippet.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-2">
                {snippet.topic_keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                ))}
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {snippet.talking_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">-</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
