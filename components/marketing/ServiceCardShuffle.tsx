"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  Globe2,
  Megaphone,
  PackageOpen,
  type LucideIcon,
} from "lucide-react";

const services: Array<{
  title: string;
  eyebrow: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}> = [
  {
    title: "Your digital product",
    eyebrow: "Offer builder",
    description: "Shape your course, ebook, coaching program, service, or skill into a clear offer people understand.",
    detail: "Product structure",
    icon: PackageOpen,
    accent: "#f5b82e",
  },
  {
    title: "A website that sells",
    eyebrow: "Page studio",
    description: "Launch a polished page with your story, pricing, videos, proof, WhatsApp, and direct calls to action.",
    detail: "Professional website",
    icon: Globe2,
    accent: "#38bdf8",
  },
  {
    title: "Content ready to post",
    eyebrow: "Marketing room",
    description: "Use campaign ideas, hooks, captions, video concepts, hashtags, and scripts built around your offer.",
    detail: "Marketing content",
    icon: Megaphone,
    accent: "#a78bfa",
  },
  {
    title: "Your first-sale roadmap",
    eyebrow: "Seven-day launch",
    description: "Follow a practical sequence that moves from setup to publishing, promotion, conversations, and sales.",
    detail: "Action roadmap",
    icon: CalendarCheck2,
    accent: "#34d399",
  },
];

export function ServiceCardShuffle() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (isShuffling) {
      return;
    }

    const timeout = window.setTimeout(() => setIsShuffling(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, isShuffling]);

  function finishShuffle() {
    setActiveIndex((current) => (current + 1) % services.length);
    setIsShuffling(false);
  }

  return (
    <div className="relative mx-auto h-[31rem] w-full max-w-xl sm:h-[32rem] lg:h-[29rem]">
      <div className="absolute left-1/2 top-1/2 h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute inset-x-4 bottom-3 top-3 sm:inset-x-7">
        {services.map((service, index) => {
          const position = (index - activeIndex + services.length) % services.length;
          const Icon = service.icon;
          const transforms = isShuffling
            ? [
                "animate-[card-shuffle-out_800ms_cubic-bezier(.55,.05,.35,1)_forwards]",
                "translate-y-0 scale-100 rotate-0 opacity-100",
                "translate-y-5 scale-[0.965] rotate-[1.8deg] opacity-70",
                "translate-y-10 scale-[0.93] -rotate-[1.8deg] opacity-35",
              ]
            : [
                "translate-y-0 scale-100 rotate-0 opacity-100",
                "translate-y-5 scale-[0.965] rotate-[1.8deg] opacity-70",
                "translate-y-10 scale-[0.93] -rotate-[1.8deg] opacity-35",
                "translate-y-14 scale-[0.9] rotate-[2.5deg] opacity-15",
              ];

          return (
            <article
              key={service.title}
              className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071426] p-6 text-white shadow-[0_35px_90px_-35px_rgba(7,20,38,.75)] transition-all duration-700 ease-out motion-reduce:transition-none sm:p-8 ${transforms[position]}`}
              style={{ zIndex: services.length - position }}
              aria-hidden={position !== 0}
              onAnimationEnd={position === 0 && isShuffling ? finishShuffle : undefined}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: service.accent }}
              />
              <div
                className="absolute -right-24 -top-24 size-64 rounded-full blur-3xl"
                style={{ backgroundColor: `${service.accent}20` }}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-300">
                  OnlineSkiller launch kit
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">0{index + 1} / 04</span>
              </div>

              <div className="mt-12 sm:mt-14 lg:mt-10">
                <span
                  className="grid size-14 place-items-center rounded-2xl border border-white/10 shadow-inner"
                  style={{ backgroundColor: `${service.accent}20`, color: service.accent }}
                >
                  <Icon className="size-7" />
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: service.accent }}>
                  {service.eyebrow}
                </p>
                <h2 className="mt-3 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">{service.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Guided setup", service.detail, "Ready to customize"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.68rem] font-medium text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:inset-x-8 sm:bottom-8">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">Next card in 5 seconds</p>
                  <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                    <span
                      key={`${activeIndex}-${isShuffling}`}
                      className="block h-full origin-left rounded-full"
                      style={{
                        backgroundColor: service.accent,
                        animation: position === 0 && !isShuffling ? "card-timer 5s linear forwards" : "none",
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {services.map((item, dotIndex) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setActiveIndex(dotIndex);
                        setIsShuffling(false);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIndex === activeIndex ? "w-7 bg-white" : "w-1.5 bg-white/30"
                      }`}
                      aria-label={`Show ${item.title}`}
                    />
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
