import { ArrowRight, Camera, Check, CirclePlay, MessageCircle, Music2 } from "lucide-react";

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
import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { TrackedCta, ViewTracker } from "@/components/public-page/ViewTracker";
import { getEmbedUrl, type VideoProvider } from "@/lib/pages/video-provider";
import { hasEnabledPaymentMethods } from "@/lib/pages/payment-methods";
import type { TemplateConfig } from "@/lib/pages/types";
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

function SectionContent({ section, config }: { section: PageSection; config: TemplateConfig }) {
  const items = section.content.items || [];
  const outlined = config.cardStyle === "outlined";
  const elevated = config.cardStyle === "elevated";

  if (section.sectionType === "faq") {
    return (
      <div className="mt-7 divide-y" style={{ borderColor: `${config.theme.text}18` }}>
        {items.map((item, index) => (
          <details key={`${item.title}-${index}`} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.title}<span className="text-xl transition group-open:rotate-45" style={{ color: config.theme.accent }}>+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: config.theme.muted }}>{item.description}</p>
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
            className="rounded-2xl p-5"
            style={{
              background: config.theme.surface,
              border: outlined ? `1px solid ${config.theme.text}18` : undefined,
              boxShadow: elevated ? "0 24px 70px -45px rgba(0,0,0,.35)" : undefined,
            }}
          >
            <p className="text-sm leading-7">“{item.description || item.title}”</p>
            <footer className="mt-4 text-xs font-bold" style={{ color: config.theme.accent }}>{item.name || item.title}</footer>
          </blockquote>
        ))}
      </div>
    );
  }

  return (
    <>
      {section.content.body ? <p className="mt-3 max-w-3xl text-base leading-7" style={{ color: config.theme.muted }}>{section.content.body}</p> : null}
      {items.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-2xl p-5"
              style={{
                background: config.theme.surface,
                border: outlined ? `1px solid ${config.theme.text}18` : undefined,
                boxShadow: elevated ? "0 24px 70px -45px rgba(0,0,0,.35)" : undefined,
              }}
            >
              <Check className="size-5" style={{ color: config.theme.accent }} />
              <h3 className="mt-7 font-semibold">{item.title}</h3>
              {item.description ? <p className="mt-2 text-sm leading-6" style={{ color: config.theme.muted }}>{item.description}</p> : null}
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
  const headingClass =
    config.typography === "editorial"
      ? "font-serif tracking-tight"
      : config.typography === "bold"
        ? "font-black tracking-[-0.045em]"
        : "font-bold tracking-tight";

  return (
    <main style={{ background: config.theme.background, color: config.theme.text }} className="min-h-screen">
      {!preview ? <ViewTracker pageId={page.id} /> : null}
      {preview ? (
        <div className="sticky top-0 z-50 bg-amber-300 px-4 py-2 text-center text-xs font-bold text-amber-950">
          Preview mode. This page is private and may not be live.
        </div>
      ) : null}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {creator.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creator.logoUrl} alt="" className="size-10 rounded-xl object-cover" />
          ) : (
            <span className="grid size-10 place-items-center rounded-xl text-sm font-black" style={{ background: config.theme.accent, color: config.theme.background }}>
              {creator.businessName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate font-semibold">{creator.businessName}</span>
        </div>
        {ctaUrl ? (
          <TrackedCta
            pageId={page.id}
            href={ctaUrl}
            newTab={!checkoutUrl}
            className="rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-90"
          >
            <span style={{ background: config.theme.accent, color: config.theme.background }} className="-m-2 block rounded-xl px-4 py-2">
              {page.ctaText}
            </span>
          </TrackedCta>
        ) : null}
      </header>

      <section className={`mx-auto grid min-h-[70svh] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:px-8 ${
        config.heroLayout === "split" ? "lg:grid-cols-2" : "text-center"
      }`}>
        <div className={config.heroLayout === "split" ? "" : "mx-auto max-w-4xl"}>
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: config.theme.accent }}>{page.category || page.pageType.replaceAll("-", " ")}</p>
          <h1 className={`mt-5 text-4xl leading-[1.05] sm:text-6xl ${headingClass}`}>{page.title}</h1>
          <p className="mt-5 text-lg leading-8" style={{ color: config.theme.muted }}>{page.subtitle}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: config.theme.muted }}>{page.description}</p>
          <div className={`mt-8 flex flex-wrap items-center gap-4 ${config.heroLayout === "split" ? "" : "justify-center"}`}>
            {ctaUrl ? (
              <TrackedCta
                pageId={page.id}
                href={ctaUrl}
                newTab={!checkoutUrl}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
              >
                <span style={{ background: config.theme.accent, color: config.theme.background }} className="-m-3 flex items-center gap-2 rounded-xl px-5 py-3">
                  {page.ctaText}<ArrowRight className="size-4" />
                </span>
              </TrackedCta>
            ) : null}
            {page.priceText ? <span className="text-xl font-bold">{page.priceText}</span> : null}
          </div>
        </div>

        {config.heroLayout === "split" ? (
          <div className="overflow-hidden rounded-[2rem] border p-3" style={{ borderColor: `${config.theme.accent}40`, background: config.theme.surface }}>
            {page.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.heroImageUrl} alt="" className="aspect-[4/3] w-full rounded-[1.4rem] object-cover" />
            ) : introEmbed ? (
              <iframe src={introEmbed} title={page.title} className="aspect-video w-full rounded-[1.4rem]" allowFullScreen />
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-[1.4rem]" style={{ background: `${config.theme.accent}16` }}>
                <div className="text-center">
                  <CirclePlay className="mx-auto size-12" style={{ color: config.theme.accent }} />
                  <p className="mt-3 text-sm font-semibold">Your offer deserves a visual story.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {introEmbed && config.heroLayout !== "split" ? (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <iframe src={introEmbed} title={page.title} className="aspect-video w-full rounded-[2rem]" allowFullScreen />
        </section>
      ) : null}

      {visibleSections.map((section, index) => (
        <section
          key={section.id}
          className="px-4 py-16 sm:px-6 lg:px-8"
          style={{ background: index % 2 === 0 ? `${config.theme.surface}88` : "transparent" }}
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: config.theme.accent }}>
              {section.sectionType.replaceAll("-", " ")}
            </p>
            <h2 className={`mt-3 text-3xl sm:text-4xl ${headingClass}`}>{section.title}</h2>
            <SectionContent section={section} config={config} />
          </div>
        </section>
      ))}

      {videos.length ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className={`text-3xl ${headingClass}`}>Watch and explore</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-2xl" style={{ background: config.theme.surface }}>
                <iframe src={getEmbedUrl(video.videoUrl, video.videoProvider as never)} title={video.title} className="aspect-video w-full" allowFullScreen />
                <div className="p-5">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: config.theme.muted }}>{video.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {modules.length ? (
        <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: `${config.theme.surface}88` }}>
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-3xl ${headingClass}`}>Course curriculum</h2>
            <div className="mt-7 space-y-3">
              {modules.map((module, index) => (
                <div key={module.id} className="rounded-2xl p-5" style={{ background: config.theme.surface }}>
                  <p className="text-xs font-bold" style={{ color: config.theme.accent }}>MODULE {index + 1}</p>
                  <h3 className="mt-2 font-semibold">{module.title}</h3>
                  <div className="mt-4 space-y-2">
                    {lessons.filter((lesson) => lesson.moduleId === module.id).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: `${config.theme.text}18` }}>
                        <span>{lesson.title}</span>
                        {lesson.isPreview ? <span className="text-xs font-bold" style={{ color: config.theme.accent }}>PREVIEW</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className={`text-3xl sm:text-5xl ${headingClass}`}>Ready to take the next step?</h2>
          <p className="mt-4 text-base" style={{ color: config.theme.muted }}>Connect directly with {creator.displayName} and get started.</p>
          {ctaUrl ? (
            <TrackedCta pageId={page.id} href={ctaUrl} newTab={!checkoutUrl} className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold">
              <span style={{ background: config.theme.accent, color: config.theme.background }} className="-m-3 flex items-center gap-2 rounded-xl px-6 py-3">{page.ctaText}<ArrowRight /></span>
            </TrackedCta>
          ) : null}
        </div>
      </section>

      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: `${config.theme.text}18` }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{creator.businessName}</p>
            <p className="mt-1 text-xs" style={{ color: config.theme.muted }}>{creator.bio}</p>
          </div>
          <div className="flex items-center gap-3">
            {creator.instagramHandle ? <a href={`https://instagram.com/${creator.instagramHandle}`} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera /></a> : null}
            {creator.tiktokHandle ? <a href={`https://tiktok.com/@${creator.tiktokHandle}`} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 /></a> : null}
            {page.whatsappEnabled && creator.whatsappNumber ? <a href={whatsappUrl(creator.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a> : null}
          </div>
        </div>
        {!removableBranding ? (
          <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center border-t pt-5" style={{ borderColor: `${config.theme.text}12` }}>
            <OnlineSkillerLogo compact />
            <span className="ml-2 text-xs" style={{ color: config.theme.muted }}>Built with OnlineSkiller</span>
          </div>
        ) : null}
      </footer>
    </main>
  );
}
