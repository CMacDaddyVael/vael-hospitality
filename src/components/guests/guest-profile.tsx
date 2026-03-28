"use client";

import { useState } from "react";
import type { Guest, Reservation, Review, GuestTimelineEvent, GuestPreferences } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GUEST_SEGMENTS } from "@/lib/constants";
import { User, Calendar, DollarSign, Star, Sparkles, MapPin, Mail, Phone, Globe } from "lucide-react";
import { format } from "date-fns";
import { RatingStars } from "@/components/reviews/rating-stars";

export function GuestProfile({
  guest,
  reservations,
  reviews,
  timeline,
}: {
  guest: Guest;
  reservations: Reservation[];
  reviews: Review[];
  timeline: GuestTimelineEvent[];
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const segment = GUEST_SEGMENTS.find((s) => s.value === guest.segment);
  const prefs = (guest.preferences ?? {}) as GuestPreferences;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to analyze guest preferences.");
        return;
      }
      window.location.reload();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {guest.first_name} {guest.last_name}
              </h1>
              {segment && (
                <Badge style={{ backgroundColor: segment.color, color: "white" }}>
                  {segment.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {guest.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {guest.email}
                </span>
              )}
              {guest.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {guest.phone}
                </span>
              )}
              {guest.nationality && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {guest.nationality}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          {analyzing ? "Analyzing..." : "Analyze Preferences"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{guest.total_stays}</p>
            <p className="text-xs text-gray-500">Total Stays</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${guest.total_spend?.toFixed(0) ?? "0"}</p>
            <p className="text-xs text-gray-500">Lifetime Spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{guest.avg_rating?.toFixed(1) ?? "-"}</p>
            <p className="text-xs text-gray-500">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${guest.lifetime_value?.toFixed(0) ?? "0"}</p>
            <p className="text-xs text-gray-500">Lifetime Value</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      {guest.ai_summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> AI Guest Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{guest.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="stays">Stays ({reservations.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-4">
          {Object.keys(prefs).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <p>No preferences extracted yet.</p>
                <p className="text-sm mt-1">Click &ldquo;Analyze Preferences&rdquo; to let AI extract guest preferences from their reviews and stay history.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {prefs.room_type && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Room Preference</p><p className="font-medium">{prefs.room_type}</p></CardContent></Card>
              )}
              {prefs.bed_type && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Bed Type</p><p className="font-medium capitalize">{prefs.bed_type}</p></CardContent></Card>
              )}
              {prefs.communication_style && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Communication</p><p className="font-medium capitalize">{prefs.communication_style}</p></CardContent></Card>
              )}
              {prefs.price_sensitivity && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Price Sensitivity</p><p className="font-medium capitalize">{prefs.price_sensitivity}</p></CardContent></Card>
              )}
              {prefs.dietary && prefs.dietary.length > 0 && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Dietary</p><div className="flex gap-1 mt-1">{prefs.dietary.map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}</div></CardContent></Card>
              )}
              {prefs.interests && prefs.interests.length > 0 && (
                <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Interests</p><div className="flex gap-1 mt-1 flex-wrap">{prefs.interests.map((i) => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}</div></CardContent></Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stays" className="mt-4 space-y-3">
          {reservations.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-500">No stays recorded.</CardContent></Card>
          ) : (
            reservations.map((res) => (
              <Card key={res.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {format(new Date(res.check_in), "MMM d")} - {format(new Date(res.check_out), "MMM d, yyyy")}
                        </span>
                        <Badge variant="outline" className="capitalize">{res.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {res.room_type && <span>Room: {res.room_type}</span>}
                        {res.room_number && <span>#{res.room_number}</span>}
                        {res.source && <span>via {res.source}</span>}
                      </div>
                    </div>
                    {res.total_amount && (
                      <span className="font-semibold">${res.total_amount.toFixed(0)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-500">No reviews linked to this guest.</CardContent></Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {format(new Date(review.review_date), "MMM d, yyyy")}
                    </span>
                    {review.sentiment && (
                      <Badge variant="outline" className="text-xs">{review.sentiment}</Badge>
                    )}
                  </div>
                  {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                  <p className="text-sm text-gray-600 line-clamp-3">{review.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {timeline.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-500">No timeline events yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">
                    {format(new Date(event.event_date), "MMM d")}
                  </span>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-gray-500">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap">
            {guest.tags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags</p>
            ) : (
              guest.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
