import { Badge } from "@/components/ui/badge";
import type { TemplateSeed } from "@/lib/pages/template-seeds";

export function TemplatePreview({
  template,
  action,
}: {
  template: TemplateSeed;
  action?: React.ReactNode;
}) {
  return (
    <article className="panel overflow-hidden rounded-2xl">
      <div
        className="relative aspect-[4/3] overflow-hidden p-4"
        style={{ background: template.config.theme.background, color: template.config.theme.text }}
      >
        <div
          className="h-full rounded-xl border p-4 shadow-xl"
          style={{
            background: template.config.theme.surface,
            borderColor: `${template.config.theme.accent}40`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.55rem] font-bold uppercase tracking-widest">Your brand</span>
            <span
              className="rounded-full px-2 py-1 text-[0.45rem] font-bold"
              style={{ background: template.config.theme.accent, color: template.config.theme.background }}
            >
              Get started
            </span>
          </div>
          <div className="mt-10 max-w-[80%]">
            <p className="text-[0.5rem] font-semibold uppercase opacity-60">A focused offer</p>
            <div className="mt-2 h-3 w-full rounded-full bg-current opacity-90" />
            <div className="mt-1.5 h-3 w-3/4 rounded-full bg-current opacity-90" />
            <div className="mt-4 h-1.5 w-full rounded-full bg-current opacity-20" />
            <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-current opacity-20" />
          </div>
          <div className="absolute bottom-7 right-7 grid grid-cols-2 gap-1">
            <span className="size-8 rounded-lg bg-current opacity-10" />
            <span className="size-8 rounded-lg bg-current opacity-20" />
            <span className="size-8 rounded-lg bg-current opacity-20" />
            <span className="size-8 rounded-lg bg-current opacity-10" />
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
