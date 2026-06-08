import { z } from "zod";

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters.").max(140),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters.").max(160),
  bio: z.string().trim().max(800),
  country: z.string().trim().min(2, "Country is required.").max(80),
  niche: z.string().trim().min(2, "Niche is required.").max(120),
  phone: z.string().trim().max(40),
  whatsappNumber: z.string().trim().min(7, "WhatsApp number is required.").max(40),
  instagramHandle: z.string().trim().max(100),
  tiktokHandle: z.string().trim().max(100),
  websiteUrl: z.string().trim().max(500),
  logoUrl: z.string().trim().max(500),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid brand color."),
  slug: z.string().trim().min(2, "Creator slug is required.").max(100),
});
