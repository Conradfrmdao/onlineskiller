"use server";

import { pagePaymentMethods } from "@/db/schema";
import { requireOwnedPage } from "@/lib/auth/ownership";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { isTrustedPayPalUrl, type PagePaymentMethodConfig, type PagePaymentMethodType } from "@/lib/pages/payment-methods";
import { cleanHttpUrl } from "@/lib/utils/urls";
import { paymentSettingsSchema } from "@/lib/validation/payment-method.schema";
import { revalidatePath } from "next/cache";

type ActionState = {
  success: boolean;
  message: string;
};

type MethodInput = {
  methodType: PagePaymentMethodType;
  label: string;
  isEnabled: boolean;
  config: PagePaymentMethodConfig;
  sortOrder: number;
};

function httpsUrl(value: string) {
  const url = cleanHttpUrl(value);
  return url.startsWith("https://") ? url : "";
}

export async function updatePagePaymentsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const page = await requireOwnedPage(pageId, profile.id);
  const parsed = paymentSettingsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check your payment settings." };
  }

  const input = parsed.data;
  const hostedEnabled = input.hostedLinkEnabled === "on";
  const paypalEnabled = input.paypalEnabled === "on";
  const bankEnabled = input.bankEnabled === "on";
  const whatsappEnabled = input.whatsappPaymentEnabled === "on";
  const hostedUrl = httpsUrl(input.hostedPaymentUrl);
  const paypalUrl = httpsUrl(input.paypalUrl);
  const whatsappPhone = input.whatsappPaymentNumber.replace(/\D/g, "");

  if (hostedEnabled && (!input.hostedProviderName || !hostedUrl)) {
    return { success: false, message: "Add a provider name and secure HTTPS payment link." };
  }

  if (paypalEnabled && (!paypalUrl || !isTrustedPayPalUrl(paypalUrl))) {
    return { success: false, message: "Add a valid HTTPS PayPal or PayPal.Me payment link." };
  }

  if (bankEnabled && (!input.bankName || !input.bankAccountName || !input.bankAccountNumber)) {
    return { success: false, message: "Bank name, account name, and account number are required." };
  }

  if (whatsappEnabled && whatsappPhone.length < 8) {
    return { success: false, message: "Add a complete WhatsApp number including country code." };
  }

  const methods: MethodInput[] = [
    {
      methodType: "hosted-link",
      label: input.hostedProviderName || "Secure online payment",
      isEnabled: hostedEnabled,
      config: {
        providerName: input.hostedProviderName,
        url: hostedUrl,
      },
      sortOrder: 0,
    },
    {
      methodType: "paypal",
      label: "PayPal",
      isEnabled: paypalEnabled,
      config: { url: paypalUrl },
      sortOrder: 1,
    },
    {
      methodType: "bank-transfer",
      label: "Bank transfer",
      isEnabled: bankEnabled,
      config: {
        bankName: input.bankName,
        accountName: input.bankAccountName,
        accountNumber: input.bankAccountNumber,
        branch: input.bankBranch,
        swiftCode: input.bankSwiftCode,
        instructions: input.bankInstructions,
      },
      sortOrder: 2,
    },
    {
      methodType: "whatsapp",
      label: "Arrange payment on WhatsApp",
      isEnabled: whatsappEnabled,
      config: {
        phone: whatsappPhone,
        message:
          input.whatsappPaymentMessage ||
          `Hi, I would like to pay for ${page.title}. Please send me the payment details.`,
      },
      sortOrder: 3,
    },
  ];

  await db.transaction(async (tx) => {
    for (const method of methods) {
      await tx
        .insert(pagePaymentMethods)
        .values({
          pageId,
          ...method,
        })
        .onConflictDoUpdate({
          target: [pagePaymentMethods.pageId, pagePaymentMethods.methodType],
          set: {
            label: method.label,
            isEnabled: method.isEnabled,
            config: method.config,
            sortOrder: method.sortOrder,
            updatedAt: new Date(),
          },
        });
    }
  });

  revalidatePath(`/dashboard/pages/${pageId}/payments`);
  revalidatePath(`/dashboard/pages/${pageId}/preview`);
  revalidatePath(`/p/${page.slug}`);
  revalidatePath(`/p/${page.slug}/checkout`);

  return { success: true, message: "Customer payment options saved." };
}
