import { z } from "zod";

export const upsellOfferSchema = z.object({
  name: z.string().min(1, "Offer name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  price_currency: z.string().default("USD"),
  price_type: z.string().default("fixed"),
  target_segments: z.array(z.string()).default([]),
  target_min_stay_nights: z.coerce.number().optional(),
  target_min_rate: z.coerce.number().optional(),
  target_room_types: z.array(z.string()).default([]),
  target_booking_sources: z.array(z.string()).default([]),
  commission_rate: z.coerce.number().min(0).max(1).default(0.10),
});
