import Link from "next/link";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATE_SEEDS } from "@/lib/pages/template-seeds";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <main>
      <PublicHeader />
      <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <Badge>Thirty original launch styles</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-6xl">A strong first impression, already handled.</h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Every template adapts to your content and brand color while preserving a deliberate, responsive layout.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_SEEDS.map((template) => (
              <TemplatePreview key={template.slug} template={template} />
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-[#071426] p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Ready to put your offer inside one?</h2>
            <Button asChild variant="gold" className="mt-5">
              <Link href="/sign-up">Start building</Link>
            </Button>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
