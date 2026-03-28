export const KB_CATEGORIES = [
  { value: "general_info", label: "General Info" },
  { value: "room_type", label: "Room Types" },
  { value: "restaurant", label: "Restaurants" },
  { value: "menu_item", label: "Menu Items" },
  { value: "spa_service", label: "Spa & Wellness" },
  { value: "policy", label: "Policies" },
  { value: "faq", label: "FAQs" },
  { value: "local_attraction", label: "Local Attractions" },
  { value: "staff_contact", label: "Staff Contacts" },
  { value: "amenity", label: "Amenities" },
  { value: "custom", label: "Custom" },
] as const;

export const CALL_RESOLUTIONS = [
  { value: "resolved", label: "Resolved" },
  { value: "transferred", label: "Transferred" },
  { value: "callback_needed", label: "Callback Needed" },
  { value: "unresolved", label: "Unresolved" },
] as const;

export const CALL_STATUSES = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "transferred", label: "Transferred" },
  { value: "failed", label: "Failed" },
  { value: "voicemail", label: "Voicemail" },
] as const;

export type KBCategory = typeof KB_CATEGORIES[number]["value"];
