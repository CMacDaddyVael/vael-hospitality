import { z } from "zod";

export const mewsCredentialsSchema = z.object({
  client_token: z.string().min(1, "Client token is required"),
  access_token: z.string().min(1, "Access token is required"),
  platform_url: z.string().url().optional(),
});

export const pmsConnectionSchema = z.object({
  provider: z.enum(["mews", "opera", "apaleo", "cloudbeds"]),
  credentials: z.record(z.string(), z.unknown()),
});
