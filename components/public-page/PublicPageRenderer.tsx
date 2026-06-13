import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  Music2,
  Quote,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { PreviewSectionEditor } from "@/components/public-page/PreviewSectionEditor";
import { TrackedCta, ViewTracker } from "@/components/public-page/ViewTracker";
import type {
  CourseLesson,
  CourseModule,
  CreatorPage,
  CreatorProfile,
  PagePaymentMethod,
  PageSection,
  PageVideo,
  Template,
} from "@/db/schema";
import { hasEnabledPaymentMethods } from "@/lib/pages/payment-methods";
import { formatOfferPrice } from "@/lib/pages/pricing";
import type { TemplateConfig } from "@/lib/pages/types";
import { getEmbedUrl, type VideoProvider } from "@/lib/pages/video-provider";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/utils/urls";

const fallbackConfig: TemplateConfig = {
  theme: {
    background: "#f4f7fb",
    surface: "#ffffff",
    text: "#071426",
    muted: "#657086",
    accent: "#1769ff",
  },
  typography: "modern",
  heroLayout: "split",
  ctaPlacement: "both",
  sectionOrder: [],
  cardStyle: "soft",
  footerStyle: "full",
};

type PublicPageData = {
  page: CreatorPage;
  creator: CreatorProfile;
  template: Template | null;
  sections: PageSection[];
  videos: PageVideo[];
  modules: CourseModule[];
  lessons: CourseLesson[];
  paymentMethods: PagePaymentMethod[];
};

const sectionIcons = {
  benefits: Target,
  features: Sparkles,
  "what-you-get": Check,
  "who-it-is-for": Users,
  testimonials: Quote,
  faq: MessageCircle,
  pricing: Clock3,
  "creator-bio": Users,
  curriculum: BookOpen,
  custom: Sparkles,
} as const;

function SectionContent({
  section,
  config,
  frameClass,
}: {
  section: PageSection;
  config: TemplateConfig;
  frameClass: string;
}) {
  const items = section.content.items || [];
  const outlined = config.cardStyle === "outlined";
  const elevated = config.cardStyle === "elevated";

  if (section.sectionType === "faq") {
    return (
      <div className="mt-7 grid gap-3">
        {items.map((item, index) => (
          <details
            key={`${item.title}-${index}`}
            className={cn("group border px-5 py-4", frameClass)}
            style={{
              background: config.theme.surface,
              borderColor: `${config.theme.text}14`,
            }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.title}
              <ChevronDown
                className="size-5 shrink-0 transition group-open:rotate-180"
                style={{ color: config.theme.accent }}
              />
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: config.theme.muted }}>
              {item.description}
            </p>
          </details>
        ))}
      </div>
    );
  }

  if (section.sectionType === "testimonials") {
    return (
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <blockquote
            key={`${item.title}-${index}`}
            className={cn("relative overflow-hidden border p-6", frameClass)}
            style={{
              background: config.theme.surface,
              borderColor: outlined ? `${config.theme.text}18` : "transparent",
              boxShadow: elevated ? "0 30px 80px -55px rgba(0,0,0,.5)" : undefined,
            }}
          >
            <Quote className="size-8 opacity-20" style={{ color: config.theme.accent }} />
            <p className="mt-5 text-base leading-7">
              &ldquo;{item.description || item.title}&rdquo;
            </p>
            <footer className="mt-5 text-sm font-bold" style={{ color: config.theme.accent }}>
              {item.name || item.title}
              {item.role ? <span className="ml-2 font-normal opacity-70">{item.role}</span> : null}
            </footer>
          </blockquote>
        ))}
      </div>
    );
  }

  return (
    <>
      {section.content.body ? (
        <p className="mt-3 max-w-3xl text-base leading-7 sm:text-lg" style={{ color: config.theme.muted }}>
          {section.content.body}
        </p>
      ) : null}
      {items.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={cn(
                "group border p-5 transition duration-300 hover:-translate-y-1 sm:p-6",
                frameClass,
              )}
              style={{
                background: config.theme.surface,
                borderColor: outlined ? `${config.theme.text}18` : "transparent",
                boxShadow: elevated ? "0 30px 80px -58px rgba(0,0,0,.55)" : undefined,
              }}
            >
              <span
                className="grid size-9 place-items-center rounded-full text-xs font-black"
                style={{ background: `${config.theme.accent}20`, color: config.theme.accent }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 text-lg font-semibold">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 text-sm leading-6" style={{ color: config.theme.muted }}>
                  {item.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function PublicPageRenderer({
  data,
  preview = false,
  removableBranding = false,
}: {
  data: PublicPageData;
  preview?: boolean;
  removableBranding?: boolean;
}) {
  const { page, creator, template, sections, videos, modules, lessons, paymentMethods } = data;
  const config = template?.config || fallbackConfig;
  const templateSlug = template?.slug || "default";
  const sharp = templateSlug === "bold-seller" || templateSlug === "tech-mentor";
  const editorial = config.typography === "editorial";
  const technical = templateSlug === "tech-mentor" || templateSlug === "digital-hustle";
  const frameClass = sharp ? "rounded-lg" : editorial ? "rounded-[2rem]" : "rounded-2xl";
  const checkoutUrl = hasEnabledPaymentMethods(paymentMethods)
    ? `/p/${page.slug}/checkout${preview ? "?preview=1" : ""}`
    : "";
  const ctaUrl =
    checkoutUrl ||
    page.ctaUrl ||
    (page.whatsappEnabled
      ? whatsappUrl(creator.whatsappNumber, `Hi ${creator.displayName}, I am interested in ${page.title}.`)
      : "");
  const visibleSections = sections.filter((section) => section.isVisible);
  const introEmbed = page.introVideoUrl
    ? getEmbedUrl(page.introVideoUrl, (page.introVideoProvider || undefined) as VideoProvider | undefined)
    : "";
  const displayPrice = formatOfferPrice(page.priceText, page.priceCurrency);
  const headingClass = editorial
    ? "font-serif font-semibold tracking-[-0.035em]"
    : config.typography === "bold"
      ? "font-black tracking-[-0.055em]"
      : config.typography === "classic"
        ? "font-serif font-bold tracking-[-0.025em]"
        : "font-bold tracking-[-0.04em]";
  const pageBackground = technical
    ? `radial-gradient(circle at 85% 10%, ${config.theme.accent}20, transparent 28%), linear-gradient(${config.theme.text}08 1px, transparent 1px), linear-gradient(90deg, ${config.theme.text}08 1px, transparent 1px), ${config.theme.background}`
    : `radial-gradient(circle at 90% 5%, ${config.theme.accent}1c, transparent 30%), ${config.theme.background}`;

  const heroMedia = (
    <div
      className={cn("relative overflow-hidden border p-2 sm:p-3", frameClass)}
      style={{
        borderColor: `${config.theme.accent}35`,
        background: config.theme.surface,
        boxShadow: "0 40px 110px -70px rgba(0,0,0,.75)",
      }}
    >
      {page.heroImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.heroImageUrl}
          alt={`${page.title} cover`}
          className={cn("aspect-[5/4] w-full object-cover sm:aspect-[4/3]", sharp ? "rounded-md" : "rounded-[1.45rem]")}
        />
      ) : introEmbed ? (
        <iframe
          src={introEmbed}
          title={page.title}
          className={cn("aspect-video w-full", sharp ? "rounded-md" : "rounded-[1.45rem]")}
          allowFullScreen
        />
      ) : (
        <div
          className={cn(
            "relative grid aspect-[5/4] place-items-center overflow-hidden p-8 text-center sm:aspect-[4/3]",
            sharp ? "rounded-md" : "rounded-[1.45rem]",
          )}
          style={{
            background: `radial-gradient(circle at 70% 20%, ${config.theme.accent}45, transparent 35%), linear-gradient(145deg, ${config.theme.accent}16, ${config.theme.background})`,
          }}
        >
          <div className="absolute -right-12 -top-12 size-44 rounded-full border opacity-20" style={{ borderColor: config.theme.accent }} />
          <div className="absolute -bottom-16 -left-8 size-52 rounded-full border opacity-15" style={{ borderColor: config.theme.accent }} />
          <div className="relative">
            <span
              className="mx-auto grid size-20 place-items-center rounded-3xl text-2xl font-black"
              style={{ background: config.theme.accent, color: config.theme.background }}
            >
              {creator.businessName.slice(0, 2).toUpperCase()}
            </span>
            <p className="mt-5 text-sm font-semibold">{creator.businessName}</p>
            {preview ? (
              <p className="mt-2 text-xs" style={{ color: config.theme.muted }}>
                Add a cover photo in Page details.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main
      style={{
        background: pageBackground,
        backgroundSize: technical ? "auto, 32px 32px, 32px 32px, auto" : undefined,
        color: config.theme.text,
      }}
      className="min-h-screen pb-24 md:pb-0"
    >
      {!preview ? <ViewTracker pageId={page.id} /> : null}
      {preview ? (
        <div className="sticky top-0 z-50 bg-amber-300 px-4 py-2 text-center text-xs font-bold text-amber-950">
          Private preview. Use Edit section on the page to update or delete content.
        </div>
      ) : null}

      <header className="px-3 pt-3 sm:px-6 sm:pt-5">
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-3 border px-3 py-2.5 sm:px-5 sm:py-3",
            sharp ? "rounded-lg" : "rounded-2xl sm:rounded-full",
          )}
          style={{
            background: `${config.theme.surface}e8`,
            borderColor: `${config.theme.text}12`,
            boxShadow: "0 20px 60px -48px rgba(0,0,0,.65)",
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            {creator.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.logoUrl}
                alt={`${creator.businessName} logo`}
                className="size-10 shrink-0 rounded-xl object-contain"
              />
            ) : (
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black"
                style={{ background: config.theme.accent, color: config.theme.background }}
              >
                {creator.businessName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate text-sm font-semibold sm:text-base">{creator.businessName}</span>
          </div>
          {ctaUrl ? (
            <TrackedCta
              pageId={page.id}
              href={ctaUrl}
              newTab={!checkoutUrl}
              className={cn(
                "hidden items-center gap-2 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 sm:inline-flex",
                sharp ? "rounded-md" : "rounded-full",
              )}
              style={{ background: config.theme.accent, color: config.theme.background }}
            >
              {page.ctaText} <ArrowRight className="size-4" />
            </TrackedCta>
          ) : null}
        </div>
      </header>

      <section
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8",
          config.heroLayout === "split" && "lg:grid-cols-[1.03fr_.97fr] lg:gap-14",
          config.heroLayout !== "split" && "text-center",
        )}
      >
        <div className={cn(config.heroLayout !== "split" && "mx-auto max-w-4xl")}>
          <div className={cn("flex flex-wrap gap-2", config.heroLayout !== "split" && "justify-center")}>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em]",
                sharp && "rounded-md",
              )}
              style={{
                color: config.theme.accent,
                borderColor: `${config.theme.accent}40`,
                background: `${config.theme.accent}10`,
              }}
            >
              {page.category || page.pageType.replaceAll("-", " ")}
            </span>
            {template ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold",
                  sharp && "rounded-md",
                )}
                style={{ borderColor: `${config.theme.text}12`, color: config.theme.muted }}
              >
                {template.name}
              </span>
            ) : null}
          </div>
          <h1 className={cn("mt-5 text-[2.75rem] leading-[0.98] sm:text-6xl lg:text-7xl", headingClass)}>
            {page.title}
          </h1>
          <p className="mt-5 text-lg leading-8 sm:text-xl" style={{ color: config.theme.muted }}>
            {page.subtitle}
          </p>
          {page.description ? (
            <p
              className={cn(
                "mt-4 max-w-2xl text-sm leading-7 sm:text-base",
                config.heroLayout !== "split" && "mx-auto",
              )}
              style={{ color: config.theme.muted }}
            >
              {page.description}
            </p>
          ) : null}

          {config.heroLayout !== "split" && (page.heroImageUrl || introEmbed) ? (
            <div className="mx-auto mt-8 max-w-3xl">{heroMedia}</div>
          ) : null}

          <div
            className={cn(
              "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center",
              config.heroLayout !== "split" && "sm:justify-center",
            )}
          >
            {ctaUrl ? (
              <TrackedCta
                pageId={page.id}
                href={ctaUrl}
                newTab={!checkoutUrl}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5",
                  sharp ? "rounded-md" : "rounded-full",
                )}
                style={{
                  background: config.theme.accent,
                  color: config.theme.background,
                  boxShadow: `0 18px 45px -24px ${config.theme.accent}`,
                }}
              >
                {page.ctaText} <ArrowRight className="size-4" />
              </TrackedCta>
            ) : null}
            {displayPrice ? (
              <div
                className={cn(
                  "flex min-h-12 items-center justify-between gap-4 border px-4 py-2 text-left sm:min-w-40",
                  sharp ? "rounded-md" : "rounded-2xl",
                )}
                style={{ borderColor: `${config.theme.text}14`, background: `${config.theme.surface}cc` }}
              >
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em]" style={{ color: config.theme.muted }}>
                  Price
                </span>
                <strong className="text-lg">{displayPrice}</strong>
              </div>
            ) : null}
          </div>
        </div>

        {config.heroLayout === "split" ? heroMedia : null}
      </section>

      {visibleSections.map((section, index) => {
        const Icon = sectionIcons[section.sectionType as keyof typeof sectionIcons] || Sparkles;
        return (
          <section key={section.id} className="px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
            <div
              className={cn(
                "relative mx-auto max-w-6xl border px-5 py-14 sm:px-8 sm:py-16 lg:px-12",
                frameClass,
              )}
              style={{
                background: index % 2 === 0 ? `${config.theme.surface}d8` : `${config.theme.surface}78`,
                borderColor: `${config.theme.text}10`,
              }}
            >
              {preview ? <PreviewSectionEditor pageId={page.id} section={section} /> : null}
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-full"
                  style={{ background: `${config.theme.accent}18`, color: config.theme.accent }}
                >
                  <Icon className="size-5" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: config.theme.accent }}>
                  {section.sectionType.replaceAll("-", " ")}
                </p>
              </div>
              <h2 className={cn("mt-5 max-w-3xl text-3xl leading-tight sm:text-5xl", headingClass)}>
                {section.title}
              </h2>
              <SectionContent section={section} config={config} frameClass={frameClass} />
            </div>
          </section>
        );
      })}

      {videos.length ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className={cn("text-3xl sm:text-5xl", headingClass)}>Watch and explore</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {videos.map((video) => (
              <article
                key={video.id}
                className={cn("overflow-hidden border", frameClass)}
                style={{ background: config.theme.surface, borderColor: `${config.theme.text}12` }}
              >
                <iframe
                  src={getEmbedUrl(video.videoUrl, video.videoProvider as never)}
                  title={video.title}
                  className="aspect-video w-full"
                  allowFullScreen
                />
                <div className="p-5 sm:p-6">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: config.theme.muted }}>
                    {video.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {modules.length ? (
        <section className="px-3 py-5 sm:px-6 lg:px-8">
          <div
            className={cn("mx-auto max-w-6xl border p-5 sm:p-8 lg:p-12", frameClass)}
            style={{ background: `${config.theme.surface}d8`, borderColor: `${config.theme.text}10` }}
          >
            <h2 className={cn("text-3xl sm:text-5xl", headingClass)}>Course curriculum</h2>
            <div className="mt-8 grid gap-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={cn("border p-5", sharp ? "rounded-md" : "rounded-2xl")}
                  style={{ background: config.theme.surface, borderColor: `${config.theme.text}12` }}
                >
                  <p className="text-xs font-bold" style={{ color: config.theme.accent }}>
                    MODULE {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{module.title}</h3>
                  <div className="mt-4 space-y-2">
                    {lessons
                      .filter((lesson) => lesson.moduleId === module.id)
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 border-t py-3 text-sm"
                          style={{ borderColor: `${config.theme.text}10` }}
                        >
                          <span>{lesson.title}</span>
                          {lesson.isPreview ? (
                            <span className="text-xs font-bold" style={{ color: config.theme.accent }}>
                              PREVIEW
                            </span>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-3 py-5 sm:px-6 sm:py-10 lg:px-8">
        <div
          className={cn("mx-auto max-w-6xl overflow-hidden border px-5 py-14 text-center sm:px-10 sm:py-20", frameClass)}
          style={{
            background: `linear-gradient(145deg, ${config.theme.surface}, ${config.theme.accent}18)`,
            borderColor: `${config.theme.accent}28`,
          }}
        >
          <span
            className="mx-auto grid size-12 place-items-center rounded-full"
            style={{ background: `${config.theme.accent}20`, color: config.theme.accent }}
          >
            <ArrowRight />
          </span>
          <h2 className={cn("mx-auto mt-6 max-w-3xl text-3xl leading-tight sm:text-5xl", headingClass)}>
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: config.theme.muted }}>
            Connect directly with {creator.displayName} and find out whether {page.title} is right for you.
          </p>
          {ctaUrl ? (
            <TrackedCta
              pageId={page.id}
              href={ctaUrl}
              newTab={!checkoutUrl}
              className={cn(
                "mt-8 inline-flex items-center gap-2 px-7 py-3.5 font-bold",
                sharp ? "rounded-md" : "rounded-full",
              )}
              style={{ background: config.theme.accent, color: config.theme.background }}
            >
              {page.ctaText} <ArrowRight />
            </TrackedCta>
          ) : null}
        </div>
      </section>

      <footer className="mt-10 border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: `${config.theme.text}12` }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {creator.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.logoUrl} alt="" className="size-10 rounded-xl object-contain" />
            ) : null}
            <div>
              <p className="font-semibold">{creator.businessName}</p>
              <p className="mt-1 max-w-xl text-xs leading-5" style={{ color: config.theme.muted }}>
                {creator.bio}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {creator.instagramHandle ? <a href={`https://instagram.com/${creator.instagramHandle}`} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera /></a> : null}
            {creator.tiktokHandle ? <a href={`https://tiktok.com/@${creator.tiktokHandle}`} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 /></a> : null}
            {page.whatsappEnabled && creator.whatsappNumber ? <a href={whatsappUrl(creator.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a> : null}
          </div>
        </div>
        {!removableBranding ? (
          <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center border-t pt-5" style={{ borderColor: `${config.theme.text}10` }}>
            <OnlineSkillerLogo compact />
            <span className="ml-2 text-xs" style={{ color: config.theme.muted }}>Built with OnlineSkiller</span>
          </div>
        ) : null}
      </footer>

      {ctaUrl ? (
        <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
          <TrackedCta
            pageId={page.id}
            href={ctaUrl}
            newTab={!checkoutUrl}
            className={cn(
              "flex min-h-14 items-center justify-between gap-3 border px-5 py-3 font-bold shadow-2xl backdrop-blur-xl",
              sharp ? "rounded-lg" : "rounded-2xl",
            )}
            style={{
              background: config.theme.accent,
              color: config.theme.background,
              borderColor: `${config.theme.background}20`,
            }}
          >
            <span>
              <span className="block text-sm">{page.ctaText}</span>
              {displayPrice ? <span className="block text-[0.68rem] font-semibold opacity-75">{displayPrice}</span> : null}
            </span>
            <ArrowRight />
          </TrackedCta>
        </div>
      ) : null}
    </main>
  );
}
