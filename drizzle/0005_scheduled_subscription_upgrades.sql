ALTER TABLE "payments" ALTER COLUMN "requested_payment_method" SET DEFAULT 'pesapal';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "scheduled_plan_name" varchar(30);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "scheduled_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "scheduled_period_end" timestamp;