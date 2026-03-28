import { z } from "zod";

export const voiceConfigSchema = z.object({
  is_enabled: z.boolean().optional(),
  forwarding_number: z.string().optional(),
  voice_id: z.string().default("Polly.Joanna"),
  tts_provider: z.string().default("amazon"),
  stt_provider: z.string().default("google"),
  primary_language: z.string().default("en"),
  supported_languages: z.array(z.string()).default(["en"]),
  auto_detect_language: z.boolean().default(true),
  greeting_message: z.string().default("Thank you for calling. How may I assist you today?"),
  after_hours_message: z.string().optional(),
  max_call_duration_seconds: z.coerce.number().min(60).max(3600).default(600),
  enable_call_recording: z.boolean().default(true),
  enable_transcription: z.boolean().default(true),
  transfer_departments: z
    .array(
      z.object({
        name: z.string(),
        number: z.string(),
        extension: z.string().optional(),
      })
    )
    .default([]),
});

export const knowledgeEntrySchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  structured_data: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
  display_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});
