"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  FileText,
  GraduationCap,
  LayoutTemplate,
  MessageCircle,
  PackageOpen,
  Presentation,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { createPageAction } from "@/actions/page-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/uploads/ImageUploadField";
import type { CreatorProfile, Template } from "@/db/schema";
import { LAUNCH_GOALS, type LaunchGoal } from "@/lib/pages/launch-flow";
import { PAGE_TYPES, PAGE_TYPE_LABELS, type PageType } from "@/lib/pages/types";
import { slugify } from "@/lib/utils/slugs";
import { cn } from "@/lib/utils";

const initialState = { success: false, message: "" };
const preferredTemplates = [
  "digital-hustle",
  "luxury-coach",
  "clean-academy",
  "bold-seller",
  "ebook-launch",
  "service-expert",
];
const templateImages: Record<string, string> = {
  "digital-hustle": "/landing/offer-builder.jpg",
  "luxury-coach": "/landing/launch-roadmap.jpg",
  "clean-academy": "/landing/page-studio.jpg",
  "bold-seller": "/landing/marketing-room.jpg",
  "ebook-launch": "/landing/offer-builder.jpg",
  "service-expert": "/landing/launch-roadmap.jpg",
};

const pageTypeDetails: Record<
  PageType,
  { description: string; icon: typeof GraduationCap }
> = {
  "online-course": { description: "Modules, lessons, outcomes", icon: GraduationCap },
  "digital-product": { description: "Sell a focused digital offer", icon: PackageOpen },
  ebook: { description: "Launch a guide or download", icon: BookOpen },
  "coaching-program": { description: "Sell coaching or mentorship", icon: Users },
  service: { description: "Present expertise and proof", icon: BriefcaseBusiness },
  workshop: { description: "Promote a dated event", icon: Presentation },
  "paid-community": { description: "Explain access and benefits", icon: MessageCircle },
  "template-pack": { description: "Show what buyers receive", icon: LayoutTemplate },
  consultation: { description: "Drive qualified bookings", icon: BriefcaseBusiness },
  other: { description: "Start with a flexible structure", icon: FileText },
};

const stepLabels = ["Launch", "Style", "Offer", "Goal", "Review"];

export function CreatePageForm({
  templates,
  profile,
  canUsePremiumTemplates,
  initialTemplateId = "",
}: {
  templates: Template[];
  profile: CreatorProfile;
  canUsePremiumTemplates: boolean;
  initialTemplateId?: string;
}) {
  const [state, action, pending] = useActionState(createPageAction, initialState);
  const [step, setStep] = useState(0);
  const [pageType, setPageType] = useState<PageType>("digital-product");
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(profile.niche || "");
  const [priceText, setPriceText] = useState("");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  const [launchGoal, setLaunchGoal] = useState<LaunchGoal>("whatsapp");
  const [ctaDestination, setCtaDestination] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const wizardTopRef = useRef<HTMLFormElement>(null);

  const curatedTemplates = useMemo(() => {
    const preferred = preferredTemplates
        .map((templateSlug) => templates.find((template) => template.slug === templateSlug))
        .filter((template): template is Template => Boolean(template));
    const remaining = templates.filter(
      (template) => !preferred.some((preferredTemplate) => preferredTemplate.id === template.id),
    );
    return [...preferred, ...remaining];
  }, [templates]);
  const selectedTemplate = curatedTemplates.find((template) => template.id === templateId);
  const selectedGoal = LAUNCH_GOALS.find((goal) => goal.value === launchGoal) || LAUNCH_GOALS[0];

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
      setSlugStatus("idle");
    }
  }

  useEffect(() => {
    if (slug.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const response = await fetch(`/api/pages/slug-availability?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        const result = (await response.json()) as { available?: boolean };
        setSlugStatus(response.ok && result.available ? "available" : "taken");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSlugStatus("error");
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [slug]);

  function canContinue() {
    if (step === 0) return Boolean(pageType);
    if (step === 1) return Boolean(templateId);
    if (step === 2) {
      return (
        title.trim().length >= 3 &&
        description.trim().length >= 10 &&
        category.trim().length >= 2 &&
        slug.length >= 2 &&
        slugStatus === "available"
      );
    }
    if (step === 3) {
      if (selectedGoal.needsDestination) {
        try {
          return ["http:", "https:"].includes(new URL(ctaDestination).protocol);
        } catch {
          return false;
        }
      }
      return true;
    }
    return true;
  }

  function moveToStep(nextStep: number) {
    setStep(Math.max(0, Math.min(stepLabels.length - 1, nextStep)));
    window.requestAnimationFrame(() => {
      wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <form
      ref={wizardTopRef}
      action={action}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_-65px_rgba(7,20,38,.55)]"
    >
      <input type="hidden" name="pageType" value={pageType} />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="launchGoal" value={launchGoal} />
      <input type="hidden" name="ctaDestination" value={ctaDestination} />
      <input type="hidden" name="introVideoUrl" value={introVideoUrl} />

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Step {step + 1} of {stepLabels.length}
            </p>
            <p className="mt-1 font-semibold text-slate-950">{stepLabels[step]}</p>
          </div>
          <span className="text-sm font-bold text-slate-500">{Math.round(((step + 1) / stepLabels.length) * 100)}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <section className={cn(step !== 0 && "hidden")}>
          <Badge>Start simple</Badge>
          <h2 className="mt-4 text-2xl font-bold">What do you want to launch?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We will generate the right page structure for your offer.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PAGE_TYPES.map((type) => {
              const detail = pageTypeDetails[type];
              const Icon = detail.icon;
              const selected = pageType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPageType(type)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{PAGE_TYPE_LABELS[type]}</span>
                    <span className="mt-1 block text-xs text-slate-500">{detail.description}</span>
                  </span>
                  {selected ? <Check className="ml-auto size-5 text-blue-600" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className={cn(step !== 1 && "hidden")}>
          <Badge>Choose by vibe</Badge>
          <h2 className="mt-4 text-2xl font-bold">Choose your starting style</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pick one strong direction. You can change it later.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {curatedTemplates.map((template) => {
              const selected = templateId === template.id;
              const locked = template.isPremium && !canUsePremiumTemplates;
              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={locked}
                  onClick={() => setTemplateId(template.id)}
                  className={cn(
                    "group overflow-hidden rounded-2xl border bg-white text-left transition disabled:cursor-not-allowed disabled:opacity-55",
                    selected
                      ? "border-blue-500 shadow-lg shadow-blue-950/10 ring-2 ring-blue-500/15"
                      : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg",
                  )}
                >
                  <span className="relative block h-36 overflow-hidden bg-slate-950">
                    <Image
                      src={templateImages[template.slug] || "/landing/page-studio.jpg"}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover opacity-80 transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                    <span
                      className="absolute left-4 top-4 h-1.5 w-14 rounded-full"
                      style={{ background: template.config.theme.accent }}
                    />
                    <span className="absolute inset-x-4 bottom-4 block text-lg font-black text-white">
                      {template.name}
                    </span>
                  </span>
                  <span className="block p-4">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{template.name}</span>
                      {template.isPremium ? <Badge variant="warning">Growth</Badge> : <Badge variant="secondary">Basic</Badge>}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-slate-500">{template.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {!templateId ? <p className="mt-4 text-sm font-medium text-amber-700">Choose one template to continue.</p> : null}
        </section>

        <section className={cn(step !== 2 && "hidden")}>
          <Badge>Tell us about it</Badge>
          <h2 className="mt-4 text-2xl font-bold">Add the essentials</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep this short. Your page will already include editable starter sections.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Business or product name</Label>
              <Input id="title" name="title" value={title} onChange={(event) => updateTitle(event.target.value)} placeholder="AI Skills Sprint" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A four-week practical program that helps professionals use AI with confidence."
                className="min-h-24"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category or niche</Label>
              <Input id="category" name="category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="AI training" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceText">Price shown to customers</Label>
              <Input id="priceText" name="priceText" value={priceText} onChange={(event) => setPriceText(event.target.value)} placeholder="$49, UGX 180,000, or Book a call" />
              <p className="text-xs leading-5 text-slate-500">
                Include the currency for the clearest checkout experience. A bare number uses your profile country.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="slug">Public page address</Label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white pl-3">
                <span className="text-sm text-slate-400">/p/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(slugify(event.target.value));
                    setSlugStatus("idle");
                  }}
                  className="border-0 shadow-none focus:ring-0"
                  required
                />
              </div>
              <p
                className={cn(
                  "text-xs font-medium",
                  slugStatus === "available" && "text-emerald-700",
                  slugStatus === "taken" && "text-red-700",
                  (slugStatus === "checking" || slugStatus === "idle" || slugStatus === "error") && "text-slate-500",
                )}
              >
                {slugStatus === "checking"
                  ? "Checking this address..."
                  : slugStatus === "available"
                    ? `Available: /p/${slug}`
                    : slugStatus === "taken"
                      ? "That address is already taken. Try another."
                      : slugStatus === "error"
                        ? "Could not check the address. Edit it to try again."
                        : "Your public link must be unique across OnlineSkiller."}
              </p>
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField
                name="logoUrl"
                label="Your logo"
                value={logoUrl}
                onChange={setLogoUrl}
                purpose="logo"
                compact
                help="Upload a square logo or brand mark. This appears in the page header."
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField
                name="heroImageUrl"
                label="Cover photo"
                value={heroImageUrl}
                onChange={setHeroImageUrl}
                purpose="cover"
                help="Show yourself, your product, or the result customers can achieve."
              />
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Using your creator profile</p>
                <p className="mt-1 text-xs text-slate-500">
                  {profile.country || "Country not set"} | {profile.whatsappNumber || "WhatsApp not set"} | @{profile.instagramHandle || "Instagram not set"}
                </p>
              </div>
              <Link href="/dashboard/settings" className="text-xs font-bold text-blue-700 hover:underline">Update profile</Link>
            </div>
          </div>
        </section>

        <section className={cn(step !== 3 && "hidden")}>
          <Badge>Conversion goal</Badge>
          <h2 className="mt-4 text-2xl font-bold">What should visitors do?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This controls the main button across your public page.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {LAUNCH_GOALS.map((goal) => {
              const selected = launchGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setLaunchGoal(goal.value)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15" : "border-slate-200 hover:border-blue-300",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold">{goal.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{goal.description}</span>
                    </span>
                    {selected ? <Check className="size-5 text-blue-600" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedGoal.needsDestination ? (
            <div className="mt-5 space-y-2">
              <Label htmlFor="ctaDestination">Where should the button go?</Label>
              <Input
                id="ctaDestination"
                value={ctaDestination}
                onChange={(event) => setCtaDestination(event.target.value)}
                placeholder="https://your-checkout-or-booking-link.com"
                type="url"
                required
              />
            </div>
          ) : (
            <Alert className="mt-5">
              We will use the {launchGoal === "whatsapp" ? "WhatsApp number" : "Instagram handle"} from your creator profile.
            </Alert>
          )}
        </section>

        <section className={cn(step !== 4 && "hidden")}>
          <Badge>Final review</Badge>
          <h2 className="mt-4 text-2xl font-bold">Your page studio is ready</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create the page, personalize its starter sections, then preview it before publishing.
          </p>
          <div className="mt-6 space-y-2">
            <Label htmlFor="introVideoUrl">Intro, demo, or testimonial video (optional)</Label>
            <div className="relative">
              <Video className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
              <Input
                id="introVideoUrl"
                value={introVideoUrl}
                onChange={(event) => setIntroVideoUrl(event.target.value)}
                placeholder="Paste a YouTube, Vimeo, Mux, Bunny, or Cloudflare link"
                className="pl-10"
                type="url"
              />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Page type", PAGE_TYPE_LABELS[pageType]],
              ["Template", selectedTemplate?.name || "Not selected"],
              ["Offer", title || "Not added"],
              ["Goal", selectedGoal.label],
              ["Public link", `/p/${slug || "your-page"}`],
              ["Price", priceText || "Not shown yet"],
              ["Cover photo", heroImageUrl ? "Added" : "Add after creating"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <Alert className="mt-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-blue-600" />
              <p>OnlineSkiller will generate benefits, offer details, proof, and FAQ sections matched to this page type.</p>
            </div>
          </Alert>
        </section>

        {state.message ? <Alert variant="destructive" className="mt-6">{state.message}</Alert> : null}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || pending}
            onClick={() => moveToStep(step - 1)}
          >
            <ArrowLeft /> Back
          </Button>
          {step < stepLabels.length - 1 ? (
            <Button
              type="button"
              size="lg"
              disabled={!canContinue()}
              onClick={() => moveToStep(step + 1)}
            >
              Continue <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={pending || !canContinue()}>
              {pending ? "Creating your studio..." : "Create page studio"} <Sparkles />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
