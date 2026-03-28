"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, GREETING_STYLES, RESPONSE_LENGTHS } from "@/lib/constants";
import { Globe, Sparkles, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

type BrandAnalysis = {
  tone: string;
  response_length: string;
  greeting_style: string;
  sign_off: string;
  custom_instructions: string;
  property_facts: Array<{ category: string; fact: string }>;
  suggested_snippets: Array<{ topic: string; keywords: string[]; talking_points: string[] }>;
};

export default function BrandVoicePage() {
  const router = useRouter();

  // URL analysis state
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState("");

  // Brand voice state
  const [tone, setTone] = useState("professional_friendly");
  const [greeting, setGreeting] = useState("dear_guest");
  const [length, setLength] = useState("medium");
  const [signOff, setSignOff] = useState("Warm regards,\nThe Team");
  const [customInstructions, setCustomInstructions] = useState("");
  const [facts, setFacts] = useState<Array<{ category: string; fact: string }>>([]);
  const [snippets, setSnippets] = useState<Array<{ topic: string; keywords: string[]; talking_points: string[] }>>([]);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/ai/analyze-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to analyze website");
        setAnalyzing(false);
        return;
      }

      const data: BrandAnalysis = await res.json();

      // Populate form with AI results
      if (data.tone) setTone(data.tone);
      if (data.response_length) setLength(data.response_length);
      if (data.greeting_style) setGreeting(data.greeting_style);
      if (data.sign_off) setSignOff(data.sign_off);
      if (data.custom_instructions) setCustomInstructions(data.custom_instructions);
      if (data.property_facts?.length) setFacts(data.property_facts);
      if (data.suggested_snippets?.length) setSnippets(data.suggested_snippets);

      setAnalyzed(true);
    } catch {
      setError("Network error. Please check the URL and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* URL Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Analyze Your Hotel Website
          </CardTitle>
          <CardDescription>
            Paste your hotel&apos;s URL and we&apos;ll automatically detect your brand voice, extract property details, and configure everything for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.yourhotel.com"
              className="flex-1"
              disabled={analyzing}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !url}
              className={analyzed ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {analyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : analyzed ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Analyzed</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Analyze</>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          {analyzed && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
              Brand voice detected and configured below. We found {facts.length} property facts and {snippets.length} smart snippets. Review and edit anything before continuing.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Voice Settings</CardTitle>
          <CardDescription>
            {analyzed ? "We've configured these based on your website. Edit anything that doesn't look right." : "Configure how AI responds to your reviews. You can refine this later."}
          </CardDescription>
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
              <Label>Sign Off</Label>
              <Textarea value={signOff} onChange={(e) => setSignOff(e.target.value)} rows={2} />
            </div>
          </div>
          {customInstructions && (
            <div className="space-y-2">
              <Label>Brand Personality</Label>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Details (collapsible) */}
      {(facts.length > 0 || snippets.length > 0) && (
        <Card>
          <CardHeader>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="text-base">
                Extracted Details ({facts.length} facts, {snippets.length} snippets)
              </CardTitle>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CardHeader>
          {showDetails && (
            <CardContent className="space-y-4">
              {facts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Property Facts</Label>
                  <div className="space-y-1.5">
                    {facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{fact.category}</Badge>
                        <span className="text-gray-700">{fact.fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {snippets.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Smart Snippets</Label>
                  <div className="space-y-2">
                    {snippets.map((snippet, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs capitalize">{snippet.topic}</Badge>
                          {snippet.keywords.map((kw) => (
                            <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {snippet.talking_points.map((tp, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-gray-400 mt-0.5">-</span> {tp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Action buttons */}
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
          {analyzed ? "Save & Start" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
