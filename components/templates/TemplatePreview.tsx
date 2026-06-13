import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { TemplateSeed } from "@/lib/pages/template-seeds";
import { cn } from "@/lib/utils";

const previewImages: Record<string, string> = {
  "clean-academy": "/landing/page-studio.jpg",
  "creator-pro": "/landing/marketing-room.jpg",
  "digital-hustle": "/landing/offer-builder.jpg",
  "ebook-launch": "/templates/ebook-launch.jpg",
  "luxury-coach": "/templates/luxury-coach.jpg",
  "premium-consultant": "/templates/premium-consultant.jpg",
  "service-expert": "/landing/launch-roadmap.jpg",
  "tech-mentor": "/templates/tech-mentor.jpg",
  "workshop-page": "/templates/workshop-page.jpg",
  "bold-seller": "/templates/bold-seller.jpg",
};

export function TemplatePreview({
  template,
  action,
}: {
  template: TemplateSeed;
  action?: React.ReactNode;
}) {
  const config = template.config;
  const outlined = config.cardStyle === "outlined";
  const sharp = template.slug === "bold-seller" || template.slug === "tech-mentor";
  const image = previewImages[template.slug] || "/landing/offer-builder.jpg";

  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_24px_70px_-55px_rgba(7,20,38,.45)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_30px_80px_-48px_rgba(23,105,255,.36)]">
      <div
        className="relative aspect-[16/11] overflow-hidden p-3"
        style={{ background: config.theme.background, color: config.theme.text }}
      >
        <div
          className={cn(
            "relative h-full overflow-hidden border shadow-2xl",
            sharp ? "rounded-md" : "rounded-xl",
          )}
          style={{
            background: config.theme.surface,
            borderColor: outlined ? `${config.theme.accent}55` : `${config.theme.text}12`,
          }}
        >
          <div
            className="flex h-7 items-center justify-between border-b px-2.5"
            style={{ borderColor: `${config.theme.text}10` }}
          >
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-current opacity-15" />
              <span className="size-1.5 rounded-full bg-current opacity-15" />
              <span className="size-1.5 rounded-full bg-current opacity-15" />
            </div>
            <span className="text-[0.42rem] font-bold uppercase tracking-[0.18em] opacity-65">
              Your brand
            </span>
            <span className="size-1.5 rounded-full" style={{ background: config.theme.accent }} />
          </div>

          <div
            className={cn(
              "grid h-[calc(100%-1.75rem)] gap-2 p-3",
              config.heroLayout === "split" && "grid-cols-[1.05fr_.95fr] items-center",
              config.heroLayout === "centered" && "place-items-center text-center",
              config.heroLayout === "stacked" && "grid-rows-[auto_1fr]",
            )}
          >
            <div className={cn(config.heroLayout === "centered" && "max-w-[78%]")}>
              <span
                className="inline-block rounded-full px-2 py-1 text-[0.38rem] font-bold uppercase tracking-wider"
                style={{ background: `${config.theme.accent}20`, color: config.theme.accent }}
              >
                Launch your offer
              </span>
              <div className="mt-2 h-2.5 w-full max-w-40 rounded-full bg-current opacity-90" />
              <div className="mt-1.5 h-2.5 w-4/5 rounded-full bg-current opacity-90" />
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-current opacity-15" />
              <div className="mt-1 h-1.5 w-3/4 rounded-full bg-current opacity-15" />
              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1 px-2.5 py-1.5 text-[0.42rem] font-black",
                  sharp ? "rounded-sm" : "rounded-full",
                )}
                style={{ background: config.theme.accent, color: config.theme.background }}
              >
                Get started <ArrowUpRight className="size-2" />
              </span>
            </div>

            {config.heroLayout !== "centered" ? (
              <div
                className={cn(
                  "relative min-h-0 overflow-hidden",
                  config.heroLayout === "stacked" ? "h-full" : "aspect-[4/5]",
                  sharp ? "rounded-sm" : "rounded-lg",
                )}
              >
                <Image src={image} alt="" fill sizes="360px" className="object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: `inset 0 0 0 1px ${config.theme.text}12` }}
                />
              </div>
            ) : (
              <div className="absolute inset-x-8 bottom-3 grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="h-7 rounded-md border"
                    style={{
                      borderColor: `${config.theme.text}10`,
                      background: `${config.theme.accent}${item === 1 ? "22" : "10"}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">{template.name}</h2>
          <Badge variant={template.isPremium ? "warning" : "secondary"}>
            {template.isPremium ? "Premium" : "Starter"}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </article>
  );
}
