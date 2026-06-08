import Link from "next/link";
import { Camera, Plug } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";

export default async function IntegrationsPage() {
  await requireCreator();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Integrations" title="Connect the tools around your business" description="The MVP starts with clear placeholders and only adds integrations through official APIs." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel rounded-2xl p-5">
          <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-pink-50 text-pink-600"><Camera /></span><Badge variant="warning">Coming soon</Badge></div>
          <h2 className="mt-8 text-lg font-semibold">Instagram professional account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Future scheduling will use official Meta APIs and require a professional account.</p>
          <Button asChild variant="outline" className="mt-5"><Link href="/dashboard/integrations/instagram">View preview</Link></Button>
        </div>
        <div className="panel rounded-2xl border-dashed p-5">
          <Plug className="size-6 text-blue-600" />
          <h2 className="mt-8 text-lg font-semibold">More integrations</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Email capture, custom domains, and delivery tools are planned after the core launch workflow.</p>
        </div>
      </div>
    </div>
  );
}
