import type { Database } from "./supabase/types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type BrandVoice = Database["public"]["Tables"]["brand_voices"]["Row"];
export type SmartSnippet = Database["public"]["Tables"]["smart_snippets"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewResponse = Database["public"]["Tables"]["review_responses"]["Row"];
export type ReviewSource = Database["public"]["Tables"]["review_sources"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type ImportBatch = Database["public"]["Tables"]["import_batches"]["Row"];

export type PropertyFact = {
  category: string;
  fact: string;
};

export type ExampleResponse = {
  review_excerpt: string;
  ideal_response: string;
};

export type ReviewAnalysis = {
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentiment_score: number;
  topics: string[];
  summary: string;
  key_phrases: string[];
  urgency: "low" | "normal" | "high" | "critical";
  language: string;
};

// Guest Personalization & Upselling types

export type Guest = {
  id: string;
  property_id: string;
  organization_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  language: string;
  pms_guest_id: string | null;
  pms_connection_id: string | null;
  matched_reviewer_names: string[];
  segment: string | null;
  segment_confidence: number | null;
  preferences: GuestPreferences;
  ai_summary: string | null;
  lifetime_value: number;
  total_stays: number;
  total_spend: number;
  avg_rating: number | null;
  last_stay_at: string | null;
  first_stay_at: string | null;
  tags: string[];
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GuestPreferences = {
  room_type?: string;
  floor_preference?: "high" | "low";
  bed_type?: "king" | "twin";
  dietary?: string[];
  amenities?: string[];
  communication_style?: "formal" | "casual" | "minimal";
  price_sensitivity?: "low" | "medium" | "high";
  interests?: string[];
};

export type Reservation = {
  id: string;
  guest_id: string;
  property_id: string;
  organization_id: string;
  pms_connection_id: string | null;
  pms_reservation_id: string | null;
  status: string;
  check_in: string;
  check_out: string;
  room_type: string | null;
  room_number: string | null;
  rate_amount: number | null;
  rate_currency: string;
  total_amount: number | null;
  adults: number;
  children: number;
  source: string | null;
  special_requests: string | null;
  upsell_campaign_sent_at: string | null;
  upsell_revenue: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PMSConnection = {
  id: string;
  property_id: string;
  organization_id: string;
  provider: string;
  status: string;
  credentials: Record<string, unknown>;
  webhook_secret: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
  last_sync_error_at: string | null;
  sync_cursor: Record<string, unknown>;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UpsellOffer = {
  id: string;
  property_id: string;
  organization_id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  price_currency: string;
  price_type: string;
  target_segments: string[];
  target_min_stay_nights: number | null;
  target_min_rate: number | null;
  target_room_types: string[];
  target_booking_sources: string[];
  is_active: boolean;
  display_order: number;
  image_url: string | null;
  commission_rate: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UpsellSend = {
  id: string;
  reservation_id: string;
  guest_id: string;
  property_id: string;
  organization_id: string;
  channel: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  offer_ids: string[];
  personalization_context: Record<string, unknown>;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  accepted_offer_ids: string[];
  total_revenue: number;
  commission_amount: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GuestMessage = {
  id: string;
  guest_id: string;
  reservation_id: string | null;
  property_id: string;
  organization_id: string;
  message_type: string;
  channel: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  ai_model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GuestTimelineEvent = {
  id: string;
  guest_id: string;
  property_id: string;
  organization_id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type UpsellOfferMatch = {
  offer_id: string;
  rank: number;
  reasoning: string;
  personalized_pitch: string;
};

// Voice Telephony types

export type VoiceConfiguration = {
  id: string;
  property_id: string;
  organization_id: string;
  is_enabled: boolean;
  twilio_phone_number: string | null;
  twilio_phone_number_sid: string | null;
  forwarding_number: string | null;
  voice_id: string;
  tts_provider: string;
  stt_provider: string;
  primary_language: string;
  supported_languages: string[];
  auto_detect_language: boolean;
  greeting_message: string;
  after_hours_message: string | null;
  max_call_duration_seconds: number;
  enable_call_recording: boolean;
  enable_transcription: boolean;
  transfer_departments: Array<{ name: string; number: string; extension?: string }>;
  operating_hours: Record<string, { open: string; close: string }> | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type VoiceKnowledgeEntry = {
  id: string;
  property_id: string;
  organization_id: string;
  category: string;
  title: string;
  content: string;
  structured_data: Record<string, unknown>;
  tags: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type VoiceCall = {
  id: string;
  property_id: string;
  organization_id: string;
  twilio_call_sid: string;
  twilio_recording_sid: string | null;
  twilio_recording_url: string | null;
  caller_phone: string | null;
  caller_name: string | null;
  guest_id: string | null;
  direction: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  detected_language: string | null;
  topics: string[];
  summary: string | null;
  sentiment: string | null;
  resolution: string | null;
  transferred_to: string | null;
  actions_taken: Array<Record<string, unknown>>;
  cost_total: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type VoiceCallMessage = {
  id: string;
  call_id: string;
  role: string;
  content: string;
  tool_calls: Array<Record<string, unknown>> | null;
  confidence: number | null;
  language: string | null;
  duration_ms: number | null;
  latency_ms: number | null;
  created_at: string;
};
