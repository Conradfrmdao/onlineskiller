CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" varchar(30) DEFAULT 'system' NOT NULL,
	"actor_id" varchar(255) DEFAULT 'system' NOT NULL,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_calendar_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"page_id" uuid,
	"asset_id" uuid,
	"strategy_id" uuid,
	"title" varchar(180) NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"platform" varchar(60) DEFAULT 'instagram' NOT NULL,
	"scheduled_for" timestamp,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"video_url" text,
	"video_provider" varchar(40),
	"duration" varchar(30) DEFAULT '' NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"resource_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(140) NOT NULL,
	"business_name" varchar(160) NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"country" varchar(80) DEFAULT '' NOT NULL,
	"niche" varchar(120) DEFAULT '' NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"whatsapp_number" varchar(40) DEFAULT '' NOT NULL,
	"instagram_handle" varchar(100) DEFAULT '' NOT NULL,
	"tiktok_handle" varchar(100) DEFAULT '' NOT NULL,
	"website_url" text,
	"logo_url" text,
	"brand_color" varchar(20) DEFAULT '#2563eb' NOT NULL,
	"slug" varchar(100) NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"scope" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'processing' NOT NULL,
	"response_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instagram_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"instagram_user_id" varchar(255),
	"username" varchar(120),
	"account_type" varchar(60),
	"access_token_encrypted" text,
	"token_expires_at" timestamp,
	"is_connected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"niche" varchar(100) DEFAULT 'all' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"source" text NOT NULL,
	"license_type" varchar(120) NOT NULL,
	"duration" varchar(30) DEFAULT '' NOT NULL,
	"orientation" varchar(30) DEFAULT 'vertical' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_captions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"hook" text NOT NULL,
	"caption" text NOT NULL,
	"hashtags" text NOT NULL,
	"cta" text NOT NULL,
	"voiceover_script" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"steps_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"example_captions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"example_posts_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_cta" text NOT NULL,
	"best_platform" varchar(80) NOT NULL,
	"difficulty_level" varchar(30) DEFAULT 'beginner' NOT NULL,
	"recommended_page_type" varchar(60) DEFAULT 'all' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketing_strategies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"event_type" varchar(40) NOT NULL,
	"referrer_host" varchar(255),
	"user_agent_family" varchar(80),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"section_type" varchar(60) NOT NULL,
	"title" varchar(180) DEFAULT '' NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"video_url" text NOT NULL,
	"video_provider" varchar(40) NOT NULL,
	"duration" varchar(30) DEFAULT '' NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"template_id" uuid,
	"title" varchar(180) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"subtitle" varchar(240) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"page_type" varchar(60) NOT NULL,
	"category" varchar(100) DEFAULT '' NOT NULL,
	"price_text" varchar(100) DEFAULT '' NOT NULL,
	"cta_text" varchar(80) DEFAULT 'Get started' NOT NULL,
	"cta_url" text,
	"whatsapp_enabled" boolean DEFAULT true NOT NULL,
	"hero_image_url" text,
	"intro_video_url" text,
	"intro_video_provider" varchar(40),
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"subscription_id" uuid,
	"merchant_reference" varchar(50) NOT NULL,
	"provider_tracking_id" varchar(255),
	"provider_subscription_id" varchar(255),
	"plan_name" varchar(30) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"provider" varchar(30) NOT NULL,
	"payment_method" varchar(80),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"provider_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_merchant_reference_unique" UNIQUE("merchant_reference")
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "saved_marketing_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_marketing_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"strategy_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"plan_name" varchar(30) DEFAULT 'starter' NOT NULL,
	"provider" varchar(30) DEFAULT 'manual' NOT NULL,
	"provider_customer_id" varchar(255),
	"provider_subscription_id" varchar(255),
	"status" varchar(30) DEFAULT 'inactive' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"recurring_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"preview_image_url" text,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"page_type" varchar(60) DEFAULT 'all' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(160) DEFAULT '' NOT NULL,
	"role" varchar(30) DEFAULT 'creator' NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "content_calendar_items" ADD CONSTRAINT "content_calendar_items_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar_items" ADD CONSTRAINT "content_calendar_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar_items" ADD CONSTRAINT "content_calendar_items_asset_id_marketing_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."marketing_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar_items" ADD CONSTRAINT "content_calendar_items_strategy_id_marketing_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."marketing_strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD CONSTRAINT "instagram_accounts_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_captions" ADD CONSTRAINT "marketing_captions_asset_id_marketing_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."marketing_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_events" ADD CONSTRAINT "page_events_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_videos" ADD CONSTRAINT "page_videos_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_marketing_assets" ADD CONSTRAINT "saved_marketing_assets_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_marketing_assets" ADD CONSTRAINT "saved_marketing_assets_asset_id_marketing_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."marketing_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_marketing_strategies" ADD CONSTRAINT "saved_marketing_strategies_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_marketing_strategies" ADD CONSTRAINT "saved_marketing_strategies_strategy_id_marketing_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."marketing_strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "calendar_creator_id_idx" ON "content_calendar_items" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "calendar_scheduled_for_idx" ON "content_calendar_items" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "course_lessons_module_id_idx" ON "course_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "course_lessons_page_id_idx" ON "course_lessons" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "course_modules_page_id_idx" ON "course_modules" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_profiles_user_id_idx" ON "creator_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creator_profiles_slug_idx" ON "creator_profiles" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_key_scope_idx" ON "idempotency_keys" USING btree ("key","scope");--> statement-breakpoint
CREATE UNIQUE INDEX "instagram_creator_id_idx" ON "instagram_accounts" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "marketing_assets_category_idx" ON "marketing_assets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketing_assets_active_idx" ON "marketing_assets" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "marketing_assets_source_idx" ON "marketing_assets" USING btree ("source");--> statement-breakpoint
CREATE UNIQUE INDEX "marketing_captions_asset_id_idx" ON "marketing_captions" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "marketing_strategies_category_idx" ON "marketing_strategies" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketing_strategies_active_idx" ON "marketing_strategies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "page_events_page_id_idx" ON "page_events" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_events_type_idx" ON "page_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "page_events_created_at_idx" ON "page_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_sections_page_id_idx" ON "page_sections" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "page_sections_page_order_idx" ON "page_sections" USING btree ("page_id","sort_order");--> statement-breakpoint
CREATE INDEX "page_videos_page_id_idx" ON "page_videos" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "pages_creator_id_idx" ON "pages" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pages_live_idx" ON "pages" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_creator_id_idx" ON "payments" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_tracking_id_idx" ON "payments" USING btree ("provider_tracking_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "platform_settings_key_idx" ON "platform_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_assets_creator_asset_idx" ON "saved_marketing_assets" USING btree ("creator_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_strategies_creator_strategy_idx" ON "saved_marketing_strategies" USING btree ("creator_id","strategy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_creator_id_idx" ON "subscriptions" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_period_end_idx" ON "subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "templates_active_idx" ON "templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "templates_page_type_idx" ON "templates" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");