import { z } from "zod";

import { PAGE_TYPES, SECTION_TYPES } from "@/lib/pages/types";

export const createPageSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(180),
  slug: z.string().trim().min(2).max(120),
  pageType: z.enum(PAGE_TYPES),
  templateId: z.string().uuid().optional().or(z.literal("")),
});

export const updatePageSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240),
  description: z.string().trim().max(5000),
  pageType: z.enum(PAGE_TYPES),
  category: z.string().trim().max(100),
  priceText: z.string().trim().max(100),
  ctaText: z.string().trim().min(2).max(80),
  ctaUrl: z.string().trim().max(1000),
  heroImageUrl: z.string().trim().max(1000),
  introVideoUrl: z.string().trim().max(1000),
  templateId: z.string().uuid().optional().or(z.literal("")),
});

export const sectionSchema = z.object({
  sectionType: z.enum(SECTION_TYPES),
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().max(5000),
  items: z.string().trim().max(10000),
});

export const videoSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000),
  videoUrl: z.string().url("Enter a valid video URL.").max(1000),
  duration: z.string().trim().max(30),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});
