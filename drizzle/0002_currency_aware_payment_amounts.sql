ALTER TABLE "payments" ADD COLUMN "amount_minor" integer;
--> statement-breakpoint
UPDATE "payments"
SET "amount_minor" = CASE
  WHEN "currency" = 'UGX' THEN "amount_cents" / 100
  ELSE "amount_cents"
END;
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount_minor" SET NOT NULL;
