ALTER TABLE "payments" ADD COLUMN "amount" numeric(12, 2);
--> statement-breakpoint
UPDATE "payments"
SET "amount" = CASE
  WHEN "currency" = 'UGX' THEN "amount_minor"
  ELSE "amount_minor" / 100.0
END;
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "requested_payment_method" varchar(40) DEFAULT 'card' NOT NULL;
