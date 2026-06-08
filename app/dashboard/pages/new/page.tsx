import { asc, eq } from "drizzle-orm";

import { templates } from "@/db/schema";
import { CreatePageForm } from "@/components/pages/CreatePageForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";

export default async function NewPage() {
  await requireCreator();
  const activeTemplates = await db.select().from(templates).where(eq(templates.isActive, true)).orderBy(asc(templates.name));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="New launch"
        title="Create your page"
        description="Start with the offer and audience. You will refine every section in the studio."
      />
      <CreatePageForm templates={activeTemplates} />
    </div>
  );
}
