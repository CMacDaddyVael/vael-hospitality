import { z } from "zod";

export const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const reservationSchema = z.object({
  guest_id: z.string().uuid(),
  check_in: z.string().min(1, "Check-in date is required"),
  check_out: z.string().min(1, "Check-out date is required"),
  room_type: z.string().optional(),
  room_number: z.string().optional(),
  rate_amount: z.coerce.number().optional(),
  rate_currency: z.string().default("USD"),
  total_amount: z.coerce.number().optional(),
  adults: z.coerce.number().default(1),
  children: z.coerce.number().default(0),
  source: z.string().optional(),
  special_requests: z.string().optional(),
  status: z.string().default("confirmed"),
});
