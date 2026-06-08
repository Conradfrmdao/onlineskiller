import { notFound } from "next/navigation";

import { PaymentSettingsForm } from "@/components/pages/PaymentSettingsForm";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function PagePaymentsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const data = await getPageStudioData(pageId, profile.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Customer checkout"
        title={`Get paid for ${data.page.title}`}
        description="Choose how customers can pay you. Enabled options appear on a dedicated checkout page connected to your public sales buttons."
      />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />
      <PaymentSettingsForm
        pageId={pageId}
        methods={data.paymentMethods}
        defaultWhatsappNumber={profile.whatsappNumber}
      />
    </div>
  );
}
