import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { PagePaymentMethodConfig } from "@/lib/pages/payment-methods";
import type { PageSectionContent, TemplateConfig } from "@/lib/pages/types";

const emptyObject = sql`'{}'::jsonb`;
const emptyArray = sql`'[]'::jsonb`;

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 160 }).notNull().default(""),
    role: varchar("role", { length: 30 }).notNull().default("creator"),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("users_clerk_user_id_idx").on(table.clerkUserId),
    index("users_role_idx").on(table.role),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

export const creatorProfiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 140 }).notNull(),
    businessName: varchar("business_name", { length: 160 }).notNull(),
    bio: text("bio").notNull().default(""),
    country: varchar("country", { length: 80 }).notNull().default(""),
    niche: varchar("niche", { length: 120 }).notNull().default(""),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    whatsappNumber: varchar("whatsapp_number", { length: 40 }).notNull().default(""),
    instagramHandle: varchar("instagram_handle", { length: 100 }).notNull().default(""),
    tiktokHandle: varchar("tiktok_handle", { length: 100 }).notNull().default(""),
    websiteUrl: text("website_url"),
    logoUrl: text("logo_url"),
    brandColor: varchar("brand_color", { length: 20 }).notNull().default("#2563eb"),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("creator_profiles_user_id_idx").on(table.userId),
    index("creator_profiles_slug_idx").on(table.slug),
  ],
);

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    description: text("description").notNull(),
    previewImageUrl: text("preview_image_url"),
    config: jsonb("config_json").$type<TemplateConfig>().notNull().default(emptyObject),
    pageType: varchar("page_type", { length: 60 }).notNull().default("all"),
    isPremium: boolean("is_premium").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("templates_active_idx").on(table.isActive),
    index("templates_page_type_idx").on(table.pageType),
  ],
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    subtitle: varchar("subtitle", { length: 240 }).notNull().default(""),
    description: text("description").notNull().default(""),
    pageType: varchar("page_type", { length: 60 }).notNull(),
    category: varchar("category", { length: 100 }).notNull().default(""),
    priceText: varchar("price_text", { length: 100 }).notNull().default(""),
    ctaText: varchar("cta_text", { length: 80 }).notNull().default("Get started"),
    ctaUrl: text("cta_url"),
    whatsappEnabled: boolean("whatsapp_enabled").notNull().default(true),
    heroImageUrl: text("hero_image_url"),
    introVideoUrl: text("intro_video_url"),
    introVideoProvider: varchar("intro_video_provider", { length: 40 }),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    isLive: boolean("is_live").notNull().default(false),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("pages_creator_id_idx").on(table.creatorId),
    index("pages_status_idx").on(table.status),
    index("pages_live_idx").on(table.isLive),
    index("pages_created_at_idx").on(table.createdAt),
  ],
);

export const pagePaymentMethods = pgTable(
  "page_payment_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    methodType: varchar("method_type", { length: 40 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(false),
    config: jsonb("config_json").$type<PagePaymentMethodConfig>().notNull().default(emptyObject),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("page_payment_methods_page_type_idx").on(table.pageId, table.methodType),
    index("page_payment_methods_page_id_idx").on(table.pageId),
    index("page_payment_methods_enabled_idx").on(table.isEnabled),
  ],
);

export const pageSections = pgTable(
  "page_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    sectionType: varchar("section_type", { length: 60 }).notNull(),
    title: varchar("title", { length: 180 }).notNull().default(""),
    content: jsonb("content_json").$type<PageSectionContent>().notNull().default(emptyObject),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("page_sections_page_id_idx").on(table.pageId),
    uniqueIndex("page_sections_page_order_idx").on(table.pageId, table.sortOrder),
  ],
);

export const pageVideos = pgTable(
  "page_videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    videoUrl: text("video_url").notNull(),
    videoProvider: varchar("video_provider", { length: 40 }).notNull(),
    duration: varchar("duration", { length: 30 }).notNull().default(""),
    isPreview: boolean("is_preview").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("page_videos_page_id_idx").on(table.pageId)],
);

export const courseModules = pgTable(
  "course_modules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("course_modules_page_id_idx").on(table.pageId)],
);

export const courseLessons = pgTable(
  "course_lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    videoUrl: text("video_url"),
    videoProvider: varchar("video_provider", { length: 40 }),
    duration: varchar("duration", { length: 30 }).notNull().default(""),
    isPreview: boolean("is_preview").notNull().default(false),
    resourceUrl: text("resource_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("course_lessons_module_id_idx").on(table.moduleId),
    index("course_lessons_page_id_idx").on(table.pageId),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    planName: varchar("plan_name", { length: 30 }).notNull().default("starter"),
    provider: varchar("provider", { length: 30 }).notNull().default("manual"),
    providerCustomerId: varchar("provider_customer_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
    status: varchar("status", { length: 30 }).notNull().default("inactive"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    scheduledPlanName: varchar("scheduled_plan_name", { length: 30 }),
    scheduledPeriodStart: timestamp("scheduled_period_start"),
    scheduledPeriodEnd: timestamp("scheduled_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    recurringEnabled: boolean("recurring_enabled").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_creator_id_idx").on(table.creatorId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_period_end_idx").on(table.currentPeriodEnd),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "restrict" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
    merchantReference: varchar("merchant_reference", { length: 50 }).notNull().unique(),
    providerTrackingId: varchar("provider_tracking_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
    planName: varchar("plan_name", { length: 30 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    provider: varchar("provider", { length: 30 }).notNull(),
    requestedPaymentMethod: varchar("requested_payment_method", { length: 40 }).notNull().default("pesapal"),
    paymentMethod: varchar("payment_method", { length: 80 }),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    isRecurring: boolean("is_recurring").notNull().default(false),
    providerPayload: jsonb("provider_payload").$type<Record<string, unknown>>().notNull().default(emptyObject),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("payments_creator_id_idx").on(table.creatorId),
    uniqueIndex("payments_tracking_id_idx").on(table.providerTrackingId),
    index("payments_status_idx").on(table.status),
    index("payments_created_at_idx").on(table.createdAt),
  ],
);

export const marketingAssets = pgTable(
  "marketing_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    niche: varchar("niche", { length: 100 }).notNull().default("all"),
    tags: jsonb("tags").$type<string[]>().notNull().default(emptyArray),
    videoUrl: text("video_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    source: text("source").notNull(),
    licenseType: varchar("license_type", { length: 120 }).notNull(),
    duration: varchar("duration", { length: 30 }).notNull().default(""),
    orientation: varchar("orientation", { length: 30 }).notNull().default("vertical"),
    isPremium: boolean("is_premium").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("marketing_assets_category_idx").on(table.category),
    index("marketing_assets_active_idx").on(table.isActive),
    uniqueIndex("marketing_assets_source_idx").on(table.source),
  ],
);

export const marketingCaptions = pgTable(
  "marketing_captions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => marketingAssets.id, { onDelete: "cascade" }),
    hook: text("hook").notNull(),
    caption: text("caption").notNull(),
    hashtags: text("hashtags").notNull(),
    cta: text("cta").notNull(),
    voiceoverScript: text("voiceover_script").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("marketing_captions_asset_id_idx").on(table.assetId)],
);

export const marketingStrategies = pgTable(
  "marketing_strategies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    category: varchar("category", { length: 100 }).notNull(),
    description: text("description").notNull(),
    steps: jsonb("steps_json").$type<string[]>().notNull().default(emptyArray),
    exampleCaptions: jsonb("example_captions_json").$type<string[]>().notNull().default(emptyArray),
    examplePosts: jsonb("example_posts_json").$type<string[]>().notNull().default(emptyArray),
    recommendedCta: text("recommended_cta").notNull(),
    bestPlatform: varchar("best_platform", { length: 80 }).notNull(),
    difficultyLevel: varchar("difficulty_level", { length: 30 }).notNull().default("beginner"),
    recommendedPageType: varchar("recommended_page_type", { length: 60 }).notNull().default("all"),
    isPremium: boolean("is_premium").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("marketing_strategies_category_idx").on(table.category),
    index("marketing_strategies_active_idx").on(table.isActive),
  ],
);

export const savedMarketingAssets = pgTable(
  "saved_marketing_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => marketingAssets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("saved_assets_creator_asset_idx").on(table.creatorId, table.assetId)],
);

export const savedMarketingStrategies = pgTable(
  "saved_marketing_strategies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => marketingStrategies.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("saved_strategies_creator_strategy_idx").on(table.creatorId, table.strategyId)],
);

export const contentCalendarItems = pgTable(
  "content_calendar_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").references(() => pages.id, { onDelete: "set null" }),
    assetId: uuid("asset_id").references(() => marketingAssets.id, { onDelete: "set null" }),
    strategyId: uuid("strategy_id").references(() => marketingStrategies.id, { onDelete: "set null" }),
    title: varchar("title", { length: 180 }).notNull(),
    caption: text("caption").notNull().default(""),
    platform: varchar("platform", { length: 60 }).notNull().default("instagram"),
    scheduledFor: timestamp("scheduled_for"),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("calendar_creator_id_idx").on(table.creatorId),
    index("calendar_scheduled_for_idx").on(table.scheduledFor),
  ],
);

export const instagramAccounts = pgTable(
  "instagram_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: "cascade" }),
    instagramUserId: varchar("instagram_user_id", { length: 255 }),
    username: varchar("username", { length: 120 }),
    accountType: varchar("account_type", { length: 60 }),
    accessTokenEncrypted: text("access_token_encrypted"),
    tokenExpiresAt: timestamp("token_expires_at"),
    isConnected: boolean("is_connected").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("instagram_creator_id_idx").on(table.creatorId)],
);

export const pageEvents = pgTable(
  "page_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 40 }).notNull(),
    referrerHost: varchar("referrer_host", { length: 255 }),
    userAgentFamily: varchar("user_agent_family", { length: 80 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("page_events_page_id_idx").on(table.pageId),
    index("page_events_type_idx").on(table.eventType),
    index("page_events_created_at_idx").on(table.createdAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorType: varchar("actor_type", { length: 30 }).notNull().default("system"),
    actorId: varchar("actor_id", { length: 255 }).notNull().default("system"),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(emptyObject),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const platformSettings = pgTable(
  "platform_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 120 }).notNull().unique(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull().default(emptyObject),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("platform_settings_key_idx").on(table.key)],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 255 }).notNull(),
    scope: varchar("scope", { length: 100 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("processing"),
    responsePayload: jsonb("response_payload").$type<Record<string, unknown>>().notNull().default(emptyObject),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("idempotency_key_scope_idx").on(table.key, table.scope)],
);

export type User = typeof users.$inferSelect;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type CreatorPage = typeof pages.$inferSelect;
export type PagePaymentMethod = typeof pagePaymentMethods.$inferSelect;
export type PageSection = typeof pageSections.$inferSelect;
export type PageVideo = typeof pageVideos.$inferSelect;
export type CourseModule = typeof courseModules.$inferSelect;
export type CourseLesson = typeof courseLessons.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type MarketingAsset = typeof marketingAssets.$inferSelect;
export type MarketingStrategy = typeof marketingStrategies.$inferSelect;
