import { z } from "zod";

export const paymentSettingsSchema = z.object({
  hostedLinkEnabled: z.string().optional(),
  hostedProviderName: z.string().trim().max(80).default(""),
  hostedPaymentUrl: z.string().trim().max(1000).default(""),
  paypalEnabled: z.string().optional(),
  paypalUrl: z.string().trim().max(1000).default(""),
  bankEnabled: z.string().optional(),
  bankName: z.string().trim().max(120).default(""),
  bankAccountName: z.string().trim().max(160).default(""),
  bankAccountNumber: z.string().trim().max(120).default(""),
  bankBranch: z.string().trim().max(120).default(""),
  bankSwiftCode: z.string().trim().max(80).default(""),
  bankInstructions: z.string().trim().max(1000).default(""),
  whatsappPaymentEnabled: z.string().optional(),
  whatsappPaymentNumber: z.string().trim().max(40).default(""),
  whatsappPaymentMessage: z.string().trim().max(500).default(""),
});
