export const TONE_OPTIONS = [
  { value: "professional_friendly", label: "Professional & Friendly" },
  { value: "casual_warm", label: "Casual & Warm" },
  { value: "formal_luxury", label: "Formal & Luxurious" },
  { value: "boutique_personal", label: "Boutique & Personal" },
] as const;

export const GREETING_STYLES = [
  { value: "dear_guest", label: 'Dear [Guest Name],' },
  { value: "hi_name", label: 'Hi [Guest Name],' },
  { value: "hello", label: 'Hello,' },
  { value: "thank_you_opening", label: 'Thank you for your review,' },
] as const;

export const RESPONSE_LENGTHS = [
  { value: "short", label: "Short (50-80 words)" },
  { value: "medium", label: "Medium (80-150 words)" },
  { value: "long", label: "Long (150-250 words)" },
] as const;

export const PROPERTY_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "b_and_b", label: "Bed & Breakfast" },
  { value: "vacation_rental", label: "Vacation Rental" },
  { value: "hostel", label: "Hostel" },
  { value: "boutique", label: "Boutique Hotel" },
] as const;

export const PLATFORMS = [
  { value: "google", label: "Google", color: "#4285F4" },
  { value: "booking_com", label: "Booking.com", color: "#003580" },
  { value: "tripadvisor", label: "TripAdvisor", color: "#00AF87" },
  { value: "manual", label: "Manual", color: "#6B7280" },
] as const;

export const REVIEW_TOPICS = [
  "parking", "breakfast", "wifi", "pool", "spa", "location",
  "cleanliness", "noise", "staff", "check_in", "room_quality",
  "bathroom", "restaurant", "bar", "gym", "view", "value",
  "air_conditioning", "bed_comfort", "other",
] as const;

export const SENTIMENT_OPTIONS = [
  { value: "positive", label: "Positive", color: "#22C55E" },
  { value: "negative", label: "Negative", color: "#EF4444" },
  { value: "neutral", label: "Neutral", color: "#6B7280" },
  { value: "mixed", label: "Mixed", color: "#F59E0B" },
] as const;

export const RESPONSE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "draft_generated", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "skipped", label: "Skipped" },
] as const;

// Guest Personalization & Upselling

export const GUEST_SEGMENTS = [
  { value: "business", label: "Business Traveler", color: "#3B82F6" },
  { value: "family", label: "Family", color: "#22C55E" },
  { value: "couple", label: "Couple", color: "#EC4899" },
  { value: "luxury", label: "Luxury Seeker", color: "#A855F7" },
  { value: "budget", label: "Budget-Conscious", color: "#F59E0B" },
  { value: "group", label: "Group", color: "#06B6D4" },
] as const;

export const UPSELL_CATEGORIES = [
  { value: "room_upgrade", label: "Room Upgrade" },
  { value: "early_checkin", label: "Early Check-in" },
  { value: "late_checkout", label: "Late Checkout" },
  { value: "breakfast", label: "Breakfast" },
  { value: "spa", label: "Spa & Wellness" },
  { value: "transfer", label: "Airport Transfer" },
  { value: "package", label: "Package" },
  { value: "experience", label: "Experience" },
  { value: "other", label: "Other" },
] as const;

export const RESERVATION_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
] as const;

export const PMS_PROVIDERS = [
  { value: "mews", label: "Mews", description: "Cloud PMS for boutique & independent hotels" },
  { value: "opera", label: "Oracle Opera Cloud", description: "Enterprise PMS for hotel chains" },
  { value: "apaleo", label: "Apaleo", description: "API-first PMS for modern hotels" },
  { value: "cloudbeds", label: "Cloudbeds", description: "All-in-one platform for independents" },
] as const;

export const MESSAGE_TYPES = [
  { value: "welcome", label: "Welcome Message" },
  { value: "pre_arrival_upsell", label: "Pre-Arrival Upsell" },
  { value: "in_stay_recommendation", label: "In-Stay Recommendation" },
  { value: "post_stay_thankyou", label: "Post-Stay Thank You" },
] as const;

export const UPSELL_PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "per_night", label: "Per Night" },
  { value: "per_person", label: "Per Person" },
  { value: "percentage", label: "% of Rate" },
] as const;

export const BOOKING_SOURCES = [
  { value: "direct", label: "Direct" },
  { value: "booking_com", label: "Booking.com" },
  { value: "expedia", label: "Expedia" },
  { value: "ota_other", label: "Other OTA" },
  { value: "travel_agent", label: "Travel Agent" },
] as const;
