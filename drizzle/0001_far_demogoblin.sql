CREATE TABLE "page_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"method_type" varchar(40) NOT NULL,
	"label" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_payment_methods" ADD CONSTRAINT "page_payment_methods_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_payment_methods_page_type_idx" ON "page_payment_methods" USING btree ("page_id","method_type");--> statement-breakpoint
CREATE INDEX "page_payment_methods_page_id_idx" ON "page_payment_methods" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_payment_methods_enabled_idx" ON "page_payment_methods" USING btree ("is_enabled");