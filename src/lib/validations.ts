import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
});

export const organizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
});

export const propertySchema = z.object({
  name: z.string().min(2, "Property name is required"),
  property_type: z.string().default("hotel"),
  city: z.string().optional(),
  country: z.string().optional(),
  star_rating: z.coerce.number().min(1).max(5).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const brandVoiceSchema = z.object({
  tone: z.string(),
  language: z.string().default("en"),
  response_length: z.string().default("medium"),
  greeting_style: z.string().default("dear_guest"),
  sign_off: z.string().default("Warm regards,\nThe Team"),
  always_include: z.array(z.string()).default([]),
  never_include: z.array(z.string()).default([]),
  property_facts: z
    .array(z.object({ category: z.string(), fact: z.string() }))
    .default([]),
  custom_instructions: z.string().optional(),
  example_responses: z
    .array(
      z.object({ review_excerpt: z.string(), ideal_response: z.string() })
    )
    .default([]),
});

export const smartSnippetSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  topic_keywords: z.array(z.string()).min(1, "At least one keyword required"),
  sentiment: z.string().default("any"),
  talking_points: z.array(z.string()).min(1, "At least one talking point required"),
  priority: z.coerce.number().default(0),
});
