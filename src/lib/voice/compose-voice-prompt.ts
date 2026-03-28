import type { Property, BrandVoice, VoiceKnowledgeEntry, VoiceConfiguration, Guest, Reservation } from "@/lib/types";

export function composeVoiceSystemPrompt(
  property: Property,
  config: VoiceConfiguration,
  brandVoice: BrandVoice | null,
  knowledgeBase: VoiceKnowledgeEntry[],
  guestContext?: { guest: Guest; reservations: Reservation[] } | null
): string {
  const grouped = groupByCategory(knowledgeBase);

  const sections: string[] = [];

  // Role
  sections.push(`# Role
You are the AI voice concierge for ${property.name}, a ${property.star_rating ?? ""}${property.star_rating ? "-star " : ""}${property.property_type} in ${property.city ?? ""}${property.country ? `, ${property.country}` : ""}.
You answer phone calls and assist guests and prospective guests with anything they need.`);

  // Personality
  const tone = brandVoice?.tone ?? "professional_friendly";
  sections.push(`# Personality
- Speak naturally and conversationally — this is a PHONE CALL, not text.
- Keep responses concise (2-3 sentences per turn). Callers cannot read paragraphs.
- Tone: ${tone}
- Language: ${config.primary_language}
- Use the caller's name once you know it.
${config.auto_detect_language ? "- If the caller speaks a language other than English, respond in their language." : ""}`);

  // General Info
  if (grouped.general_info?.length) {
    sections.push(`# General Information\n${grouped.general_info.map((e) => `- **${e.title}**: ${e.content}`).join("\n")}`);
  }

  // Room Types
  if (grouped.room_type?.length) {
    sections.push(`# Room Types\n${grouped.room_type.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `## ${e.title}\n${e.content}\n- Capacity: ${d.capacity ?? "N/A"} guests\n- Rate: ${d.rate_low ?? "?"}–${d.rate_high ?? "?"} ${d.rate_currency ?? "USD"}/night\n- Amenities: ${(d.amenities as string[])?.join(", ") ?? "standard"}`;
    }).join("\n\n")}`);
  }

  // Restaurants
  if (grouped.restaurant?.length) {
    sections.push(`# Restaurants & Dining\n${grouped.restaurant.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `## ${e.title}\n${e.content}\n- Cuisine: ${d.cuisine ?? "N/A"}\n- Hours: ${d.hours ?? "N/A"}\n- Dress code: ${d.dress_code ?? "casual"}`;
    }).join("\n\n")}`);
  }

  // Menu Items
  if (grouped.menu_item?.length) {
    sections.push(`# Menu Highlights\n${grouped.menu_item.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `- ${e.title}: ${e.content} — ${d.price ?? "?"} ${d.currency ?? "USD"}`;
    }).join("\n")}`);
  }

  // Spa
  if (grouped.spa_service?.length) {
    sections.push(`# Spa & Wellness\n${grouped.spa_service.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `- **${e.title}**: ${e.content} (${d.duration_min ?? "?"}min, ${d.price ?? "?"} ${d.currency ?? "USD"})`;
    }).join("\n")}`);
  }

  // Policies
  if (grouped.policy?.length) {
    sections.push(`# Policies\n${grouped.policy.map((e) => `- **${e.title}**: ${e.content}`).join("\n")}`);
  }

  // FAQs
  if (grouped.faq?.length) {
    sections.push(`# Frequently Asked Questions\n${grouped.faq.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `**Q: ${d.question ?? e.title}**\nA: ${d.short_answer ?? e.content}`;
    }).join("\n\n")}`);
  }

  // Local Attractions
  if (grouped.local_attraction?.length) {
    sections.push(`# Local Area\n${grouped.local_attraction.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `- **${e.title}**: ${e.content} (${d.distance_km ?? "?"}km, ${d.transport ?? ""})`;
    }).join("\n")}`);
  }

  // Staff Contacts
  if (grouped.staff_contact?.length) {
    sections.push(`# Departments (for transfers)\n${grouped.staff_contact.map((e) => {
      const d = e.structured_data as Record<string, unknown>;
      return `- **${e.title}**: Extension ${d.extension ?? "N/A"}, ${d.hours ?? "24/7"}`;
    }).join("\n")}`);
  }

  // Transfer departments from config
  if (config.transfer_departments?.length) {
    sections.push(`# Transfer Directory\n${config.transfer_departments.map((d) => `- ${d.name}: ${d.number}${d.extension ? ` (ext. ${d.extension})` : ""}`).join("\n")}`);
  }

  // Amenities + Custom
  for (const cat of ["amenity", "custom"] as const) {
    if (grouped[cat]?.length) {
      sections.push(`# ${cat === "amenity" ? "Amenities" : "Additional Information"}\n${grouped[cat]!.map((e) => `- **${e.title}**: ${e.content}`).join("\n")}`);
    }
  }

  // Guest context (if caller identified)
  if (guestContext) {
    const { guest, reservations } = guestContext;
    const upcoming = reservations.find(
      (r) => r.status === "confirmed" && new Date(r.check_in) >= new Date()
    );
    sections.push(`# Current Caller
Guest: ${guest.first_name} ${guest.last_name}
Segment: ${guest.segment ?? "unknown"}
Total stays: ${guest.total_stays}
${guest.preferences ? `Preferences: ${JSON.stringify(guest.preferences)}` : ""}
${guest.notes ? `Notes: ${guest.notes}` : ""}
${upcoming ? `Upcoming reservation: ${upcoming.check_in} to ${upcoming.check_out}, ${upcoming.room_type ?? "standard"} room` : ""}`);
  }

  // Rules
  sections.push(`# Rules
1. NEVER make up information not in your knowledge base. If unsure, say you'll transfer to a team member.
2. For reservations: always confirm dates, room type, guest name, and total before finalizing.
3. If the caller asks for something outside your capabilities, offer to transfer.
4. Be proactive: if someone asks about a room, mention the rate. If they mention dates, offer to check availability.
5. For complaints, billing disputes, or medical emergencies, transfer immediately.
6. End calls gracefully: summarize actions taken and ask "Is there anything else I can help with?"
7. Keep each response to 2-3 sentences maximum. This is a phone call.`);

  return sections.join("\n\n");
}

function groupByCategory(entries: VoiceKnowledgeEntry[]): Record<string, VoiceKnowledgeEntry[]> {
  const grouped: Record<string, VoiceKnowledgeEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  return grouped;
}
