import type Anthropic from "@anthropic-ai/sdk";

export const voiceTools: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description: "Check room availability for given dates at this property.",
    input_schema: {
      type: "object" as const,
      properties: {
        check_in: { type: "string", description: "Check-in date (YYYY-MM-DD)" },
        check_out: { type: "string", description: "Check-out date (YYYY-MM-DD)" },
        room_type: { type: "string", description: "Room type preference (optional)" },
        adults: { type: "number", description: "Number of adults" },
      },
      required: ["check_in", "check_out"],
    },
  },
  {
    name: "make_reservation",
    description: "Create a new reservation. Must confirm all details with caller first.",
    input_schema: {
      type: "object" as const,
      properties: {
        guest_first_name: { type: "string" },
        guest_last_name: { type: "string" },
        guest_email: { type: "string" },
        guest_phone: { type: "string" },
        check_in: { type: "string" },
        check_out: { type: "string" },
        room_type: { type: "string" },
        adults: { type: "number" },
        children: { type: "number" },
        special_requests: { type: "string" },
      },
      required: ["guest_first_name", "guest_last_name", "check_in", "check_out", "room_type"],
    },
  },
  {
    name: "lookup_reservation",
    description: "Look up an existing reservation by confirmation number or guest name.",
    input_schema: {
      type: "object" as const,
      properties: {
        confirmation_number: { type: "string" },
        guest_name: { type: "string" },
        check_in: { type: "string" },
      },
    },
  },
  {
    name: "transfer_call",
    description: "Transfer the call to a hotel department when the AI cannot handle the request.",
    input_schema: {
      type: "object" as const,
      properties: {
        department: { type: "string", description: "Department name" },
        reason: { type: "string", description: "Brief reason for transfer" },
      },
      required: ["department"],
    },
  },
  {
    name: "lookup_guest",
    description: "Look up a guest profile by name, email, or phone.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
    },
  },
];
