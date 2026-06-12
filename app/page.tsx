import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  LayoutTemplate,
  Megaphone,
  MessageCircle,
  Palette,
  Rocket,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ServiceCardShuffle } from "@/components/marketing/ServiceCardShuffle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { number: "01", title: "Choose what to launch", description: "Course, ebook, service, coaching, workshop, or another digital offer." },
  { number: "02", title: "Make the page yours", description: "Pick a polished template and add your story, offer, video, price, and CTA." },
  { number: "03", title: "Publish and promote", description: "Go live after subscribing, then use ready strategies and content to sell." },
];

const pageTypes = [
  ["Online courses", BookOpen],
  ["Ebooks", Sparkles],
  ["Coaching programs", MessageCircle],
  ["Services", BriefcaseBusiness],
  ["Workshops", CalendarDays],
  ["Template packs", Palette],
];

const faqs = [
  ["Do I need coding skills?", "No. OnlineSkiller gives you guided forms, templates, and previews so you can launch without writing code."],
  ["Does OnlineSkiller take a commission?", "No. The MVP charges a monthly subscription and does not take commission from your customer sales."],
  ["Can I preview before paying?", "Yes. You can create, edit, and privately preview your page before activating a subscription."],
  ["What happens if my plan expires?", "Your dashboard and content remain available, but public pages become unavailable until you reactivate."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-slate-950">
      <PublicHeader />

      <section id="top" className="relative scroll-mt-24 overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:flex lg:h-[100svh] lg:min-h-[40rem] lg:items-center lg:px-8 lg:py-14">
        <div className="site-grid absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge>Built for creators ready to launch</Badge>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1.01] tracking-[-0.055em] sm:text-6xl lg:text-[clamp(3.5rem,4.2vw,4.25rem)]">
              Launch Your Digital Product, Business or Skill &amp;{" "}
              <span className="text-blue-600">Make Your First Sales.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Create and preview your product page for free. Choose a plan only when you are ready to publish,
              share your link, and start making sales.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">Start building free <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/templates">Explore templates</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {["No coding", "Preview before paying", "No sales commission"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-blue-600" /> {item}
                </span>
              ))}
            </div>
          </div>

          <ServiceCardShuffle />
        </div>
      </section>

      <section id="how-it-works" className="bg-[#071426] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <Badge className="border-white/15 bg-white/10 text-blue-200">A launch path that stays simple</Badge>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Start making money online. Don&apos;t get left out.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                <span className="text-sm font-black text-amber-300">{step.number}</span>
                <h3 className="mt-10 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <Badge variant="secondary">Built for more than courses</Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">One builder. Many ways to earn online.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">
              Shape the page around your offer instead of forcing every creator into the same course-only layout.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageTypes.map(([title, Icon]) => (
              <Card key={String(title)} className="group transition hover:-translate-y-1 hover:border-blue-200">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-semibold">{String(title)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-blue-600 p-7 text-white sm:p-10">
            <LayoutTemplate className="size-8" />
            <p className="mt-16 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Page studio</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Professional templates without generic results.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-blue-50">
              Customize the content, brand color, sections, media, pricing, CTA, and social links while the layout stays polished.
            </p>
            <Button asChild variant="gold" className="mt-7">
              <Link href="/templates">View all templates</Link>
            </Button>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-10">
            <Megaphone className="size-8 text-blue-600" />
            <p className="mt-16 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Marketing room</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">A launch page is better with a plan to promote it.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
              Browse practical strategies, licensed video ideas, hooks, captions, CTAs, scripts, and a simple content calendar.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Launch plans", "WhatsApp scripts", "Short-form hooks", "Content calendar"].map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <Badge variant="secondary">Questions, answered</Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">Launch with clarity.</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {question}
                    <span className="text-blue-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pr-10 text-sm leading-6 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071426] to-[#102a56] px-6 py-14 text-center text-white sm:px-10">
          <Rocket className="mx-auto size-9 text-amber-300" />
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Stop sending your audience to a pile of links.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Give your offer a professional home and give yourself a practical marketing system.
          </p>
          <Button asChild size="lg" variant="gold" className="mt-8">
            <Link href="/sign-up">Build your first page <WandSparkles /></Link>
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <BadgeCheck className="size-4" /> Preview before subscribing
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
