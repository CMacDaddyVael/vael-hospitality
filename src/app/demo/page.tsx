"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Inbox, Users, TrendingUp, Phone, BarChart3, MessageSquare, Zap,
  Settings, Building2, Star, Search, Upload, Sparkles, Send,
  Calendar, DollarSign, Clock, ArrowRight, Globe, User,
  CheckCircle2, AlertTriangle, Flag, ChevronRight, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_REVIEWS = [
  { id: "1", reviewer: "Sarah Mitchell", rating: 5, platform: "google", sentiment: "positive", status: "pending", date: "Mar 25, 2026", title: "Absolutely wonderful stay!", body: "From the moment we arrived, the staff was incredibly welcoming. The room was spotless with a beautiful view of the city. The breakfast buffet had an amazing selection. Will definitely return!", topics: ["staff", "room_quality", "breakfast", "view"] },
  { id: "2", reviewer: "Marco Rossi", rating: 2, platform: "booking_com", sentiment: "negative", status: "pending", date: "Mar 24, 2026", title: "Disappointing experience", body: "The room was not ready at check-in time despite early notification. WiFi kept disconnecting and the air conditioning was very loud. The only positive was the restaurant which served excellent Italian food.", topics: ["check_in", "wifi", "noise", "restaurant"], urgency: "high" },
  { id: "3", reviewer: "Yuki Tanaka", rating: 4, platform: "tripadvisor", sentiment: "positive", status: "published", date: "Mar 23, 2026", title: "Great location, minor issues", body: "Perfect location for exploring the city. The spa was wonderful and the concierge helped us book amazing restaurants. Only downside was limited parking options.", topics: ["location", "spa", "parking"] },
  { id: "4", reviewer: "Emma Thompson", rating: 5, platform: "google", sentiment: "positive", status: "draft_generated", date: "Mar 22, 2026", title: "Our anniversary was perfect", body: "The hotel went above and beyond for our anniversary celebration. The room upgrade was a lovely surprise, and the champagne waiting for us was a beautiful touch. The rooftop bar had incredible views.", topics: ["staff", "room_quality", "bar", "view"] },
  { id: "5", reviewer: "Ahmed Hassan", rating: 3, platform: "booking_com", sentiment: "mixed", status: "pending", date: "Mar 21, 2026", title: "Good but overpriced", body: "The hotel is well-maintained and the staff is friendly. However, for the price point, I expected more amenities. The pool was quite small and the gym equipment was dated. Breakfast was good though.", topics: ["value", "pool", "gym", "breakfast"] },
];

const MOCK_GUESTS = [
  { id: "1", name: "Sarah Mitchell", email: "sarah.m@email.com", segment: "luxury", stays: 4, spend: 12400, lastStay: "Mar 2026", tags: ["vip", "anniversary"] },
  { id: "2", name: "Marco Rossi", email: "m.rossi@email.com", segment: "business", stays: 8, spend: 18200, lastStay: "Mar 2026", tags: ["corporate", "frequent"] },
  { id: "3", name: "Yuki Tanaka", email: "yuki.t@email.com", segment: "couple", stays: 2, spend: 4800, lastStay: "Mar 2026", tags: [] },
  { id: "4", name: "Emma Thompson", email: "emma.t@email.com", segment: "luxury", stays: 3, spend: 9600, lastStay: "Mar 2026", tags: ["loyalty_gold"] },
  { id: "5", name: "David Chen", email: "d.chen@email.com", segment: "family", stays: 5, spend: 14200, lastStay: "Feb 2026", tags: ["family", "long_stay"] },
];

const MOCK_CALLS = [
  { id: "1", caller: "+1 (415) 555-0123", name: "Sarah Mitchell", duration: "4:32", language: "en", topics: ["reservation", "spa"], resolution: "resolved", summary: "Guest called to book a spa appointment for her upcoming stay. Confirmed Swedish massage for March 28 at 2pm.", time: "2:15 PM" },
  { id: "2", caller: "+33 6 12 34 56 78", name: null, duration: "2:18", language: "fr", topics: ["availability", "rates"], resolution: "resolved", summary: "French-speaking caller inquired about room availability for April 5-8. Quoted Deluxe King at $399/night. Caller said they'd call back to confirm.", time: "11:42 AM" },
  { id: "3", caller: "+1 (212) 555-0456", name: "David Chen", duration: "6:45", language: "en", topics: ["complaint", "maintenance"], resolution: "transferred", summary: "Guest in room 412 reported AC not working. Created maintenance request. Transferred to duty manager for follow-up.", time: "9:30 AM" },
];

const segmentColors: Record<string, string> = {
  luxury: "bg-purple-100 text-purple-700",
  business: "bg-blue-100 text-blue-700",
  couple: "bg-pink-100 text-pink-700",
  family: "bg-green-100 text-green-700",
};

const platformColors: Record<string, { bg: string; label: string }> = {
  google: { bg: "bg-blue-500", label: "Google" },
  booking_com: { bg: "bg-blue-900", label: "Booking.com" },
  tripadvisor: { bg: "bg-emerald-500", label: "TripAdvisor" },
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  negative: "bg-red-100 text-red-700",
  mixed: "bg-amber-100 text-amber-700",
  neutral: "bg-gray-100 text-gray-600",
};

const statusStyles: Record<string, { bg: string; label: string }> = {
  pending: { bg: "border border-gray-200 text-gray-600", label: "Pending" },
  draft_generated: { bg: "bg-blue-50 text-blue-700 border border-blue-200", label: "Draft" },
  published: { bg: "bg-green-50 text-green-700 border border-green-200", label: "Published" },
};

const resolutionColors: Record<string, string> = {
  resolved: "bg-green-100 text-green-700",
  transferred: "bg-blue-100 text-blue-700",
};

type ActivePage = "reviews" | "guests" | "upsell" | "voice";

export default function DemoPage() {
  const [activePage, setActivePage] = useState<ActivePage>("reviews");
  const [selectedReview, setSelectedReview] = useState(MOCK_REVIEWS[0]);

  const navItems = [
    { key: "reviews" as const, label: "Reviews", icon: Inbox, count: 3 },
    { key: "guests" as const, label: "Guests", icon: Users },
    { key: "upsell" as const, label: "Upsell", icon: TrendingUp },
    { key: "voice" as const, label: "Voice", icon: Phone },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="flex h-screen w-64 flex-col border-r bg-white shrink-0">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-sm">Vael Hospitality</span>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="font-medium truncate">The Grand Hotel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full",
                activePage === item.key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.count && (
                <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.count}</span>
              )}
            </button>
          ))}

          <div className="pt-4">
            <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Settings className="h-3.5 w-3.5" /> Settings
            </div>
            {["Property", "Brand Voice", "Smart Snippets", "Voice Agent", "Knowledge Base"].map((item) => (
              <div key={item} className="block rounded-md px-3 py-1.5 pl-10 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">{item}</div>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight className="h-3 w-3 rotate-180" /> Back to website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Demo Mode</span>
            <span>Viewing sample data from The Grand Hotel, New York</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup" className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700">
              Start Free Trial
            </Link>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">JD</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {activePage === "reviews" && (
            <ReviewsDemo
              reviews={MOCK_REVIEWS}
              selectedReview={selectedReview}
              onSelectReview={setSelectedReview}
            />
          )}
          {activePage === "guests" && <GuestsDemo guests={MOCK_GUESTS} />}
          {activePage === "upsell" && <UpsellDemo />}
          {activePage === "voice" && <VoiceDemo calls={MOCK_CALLS} />}
        </main>
      </div>
    </div>
  );
}

function ReviewsDemo({ reviews, selectedReview, onSelectReview }: {
  reviews: typeof MOCK_REVIEWS;
  selectedReview: typeof MOCK_REVIEWS[0];
  onSelectReview: (r: typeof MOCK_REVIEWS[0]) => void;
}) {
  const [aiResponse, setAiResponse] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setAiResponse("");
    const response = selectedReview.sentiment === "negative"
      ? `Dear ${selectedReview.reviewer.split(" ")[0]},\n\nThank you for taking the time to share your feedback with us. We sincerely apologize for the difficulties you experienced during your stay, particularly regarding the room readiness at check-in and the WiFi connectivity issues.\n\nWe have since upgraded our network infrastructure and implemented a new room-readiness tracking system to ensure these situations do not recur. We're pleased you enjoyed our restaurant - our chef takes great pride in crafting authentic Italian cuisine.\n\nWe would welcome the opportunity to demonstrate the improvements we've made. Please don't hesitate to reach out directly, and we would be happy to offer a special rate for your next visit.\n\nWarm regards,\nThe Grand Hotel Team`
      : `Dear ${selectedReview.reviewer.split(" ")[0]},\n\nWhat a pleasure it is to read your kind words! We are thrilled that you enjoyed your stay with us, from the warm welcome to the beautiful room views and our breakfast selection.\n\nOur team takes great pride in creating memorable experiences for our guests, and it truly means the world to know we succeeded in making your visit special.\n\nWe look forward to welcoming you back soon. Until then, wishing you all the best.\n\nWarm regards,\nThe Grand Hotel Team`;

    let i = 0;
    const interval = setInterval(() => {
      setAiResponse(response.slice(0, i));
      i += 3;
      if (i >= response.length) {
        setAiResponse(response);
        setGenerating(false);
        clearInterval(interval);
      }
    }, 10);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <button className="inline-flex items-center gap-2 border border-gray-200 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search reviews..." />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm text-gray-600"><option>All Platforms</option></select>
        <select className="border rounded-lg px-3 py-2 text-sm text-gray-600"><option>All Ratings</option></select>
        <select className="border rounded-lg px-3 py-2 text-sm text-gray-600"><option>All Sentiment</option></select>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Review list */}
        <div className="w-[420px] shrink-0 rounded-xl border bg-white overflow-auto">
          {reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => { onSelectReview(review); setAiResponse(""); }}
              className={cn(
                "w-full text-left border-b p-4 transition-colors hover:bg-gray-50",
                selectedReview.id === review.id && "bg-blue-50/50 border-l-2 border-l-blue-500"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.reviewer}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${platformColors[review.platform].bg}`}>
                      {platformColors[review.platform].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />)}</div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1 truncate">{review.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{review.body}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", sentimentColors[review.sentiment])}>{review.sentiment}</span>
                    {review.topics.slice(0, 2).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full border text-gray-500">{t}</span>)}
                  </div>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full shrink-0", statusStyles[review.status].bg)}>
                  {statusStyles[review.status].label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Review detail + response */}
        <div className="flex-1 overflow-auto space-y-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{selectedReview.reviewer}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${platformColors[selectedReview.platform].bg}`}>
                {platformColors[selectedReview.platform].label}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", statusStyles[selectedReview.status].bg)}>
                {statusStyles[selectedReview.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-4 w-4", i < selectedReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />)}</div>
              <span className="text-sm text-gray-400">{selectedReview.date}</span>
              {"urgency" in selectedReview && (
                <span className="text-xs text-orange-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> High urgency</span>
              )}
            </div>
            <h4 className="font-medium mb-2">{selectedReview.title}</h4>
            <p className="text-gray-700 leading-relaxed">{selectedReview.body}</p>
            <div className="flex gap-1.5 mt-4">
              {selectedReview.topics.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full border text-gray-500">{t}</span>)}
            </div>
          </div>

          {/* AI Response */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Response</h4>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Sparkles className={cn("h-4 w-4", generating && "animate-pulse text-blue-500")} />
                {generating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <div className="min-h-[200px] border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {aiResponse || <span className="text-gray-400">Click &ldquo;Generate with AI&rdquo; to create a personalized response...</span>}
              {generating && <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />}
            </div>
            {aiResponse && !generating && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{aiResponse.split(/\s+/).length} words</span>
                <div className="flex gap-2">
                  <button className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">Save Draft</button>
                  <button className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestsDemo({ guests }: { guests: typeof MOCK_GUESTS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 border text-sm px-3 py-2 rounded-lg hover:bg-gray-50"><Upload className="h-4 w-4" /> Import CSV</button>
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-3 py-2 rounded-lg"><Plus className="h-4 w-4" /> Add Guest</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-xl border p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{guest.name}</h3>
                  <p className="text-xs text-gray-500">{guest.email}</p>
                </div>
              </div>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", segmentColors[guest.segment])}>
                {guest.segment}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {guest.stays} stays</span>
              <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ${guest.spend.toLocaleString()}</span>
              <span>Last: {guest.lastStay}</span>
            </div>
            {guest.tags.length > 0 && (
              <div className="flex gap-1 mt-3">
                {guest.tags.map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500">{tag}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UpsellDemo() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upsell Dashboard</h1>
        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-3 py-2 rounded-lg">Manage Offers</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: "Revenue This Month", value: "$4,280", sub: "+24% vs last month", color: "text-green-600" },
          { icon: Send, label: "Campaigns Sent", value: "47", sub: "This month" },
          { icon: CheckCircle2, label: "Acceptance Rate", value: "18.2%", sub: "Industry avg: 12%" },
          { icon: TrendingUp, label: "Active Offers", value: "6", sub: "In library" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <card.icon className="h-4 w-4" /> {card.label}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className={cn("text-xs mt-1", card.color ?? "text-gray-400")}>{card.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Top Performing Offers</h3>
          {[
            { name: "Deluxe Room Upgrade", category: "Room Upgrade", revenue: "$1,890", rate: "22%" },
            { name: "Breakfast Package", category: "F&B", revenue: "$1,240", rate: "28%" },
            { name: "Late Checkout (2pm)", category: "Convenience", revenue: "$680", rate: "15%" },
            { name: "Spa Welcome Package", category: "Wellness", revenue: "$470", rate: "12%" },
          ].map((offer) => (
            <div key={offer.name} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{offer.name}</p>
                <p className="text-xs text-gray-500">{offer.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">{offer.revenue}</p>
                <p className="text-xs text-gray-400">{offer.rate} acceptance</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Recent Campaigns</h3>
          {[
            { guest: "Sarah Mitchell", offers: 3, status: "opened", revenue: "$399" },
            { guest: "Marco Rossi", offers: 2, status: "sent", revenue: "$0" },
            { guest: "Emma Thompson", offers: 3, status: "clicked", revenue: "$149" },
            { guest: "David Chen", offers: 2, status: "accepted", revenue: "$299" },
          ].map((campaign) => (
            <div key={campaign.guest} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{campaign.guest}</p>
                <p className="text-xs text-gray-500">{campaign.offers} offers</p>
              </div>
              <div className="text-right">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", campaign.status === "accepted" ? "bg-green-100 text-green-700" : campaign.status === "clicked" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>{campaign.status}</span>
                {parseFloat(campaign.revenue.replace("$", "")) > 0 && (
                  <p className="text-xs font-medium text-green-600 mt-1">{campaign.revenue}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceDemo({ calls }: { calls: typeof MOCK_CALLS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voice Calls</h1>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
          </span>
          <span className="text-xs text-gray-500">+1 (212) 555-8000</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: Phone, label: "Calls Today", value: "12" },
          { icon: Clock, label: "Avg Duration", value: "3:42" },
          { icon: CheckCircle2, label: "Resolved", value: "92%" },
          { icon: Globe, label: "Languages", value: "4" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2"><card.icon className="h-4 w-4" /> {card.label}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className="bg-white rounded-xl border p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{call.caller}</p>
                    {call.name && <span className="text-xs text-gray-500">({call.name})</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>Today {call.time}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {call.duration}</span>
                    {call.language !== "en" && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{call.language.toUpperCase()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {call.topics.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border text-gray-500">{t}</span>)}
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", resolutionColors[call.resolution])}>{call.resolution}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 ml-14">{call.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
