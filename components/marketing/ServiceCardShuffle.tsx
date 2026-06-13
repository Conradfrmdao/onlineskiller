"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "Shape a product people understand",
    eyebrow: "Offer builder",
    description: "Turn your course, ebook, coaching, service, or skill into a focused offer with a clear next step.",
    image: "/landing/offer-builder.jpg",
    accent: "#f5b82e",
  },
  {
    title: "Launch a page that feels like your brand",
    eyebrow: "Page studio",
    description: "Use your own logo, photography, pricing, proof, video, and calls to action on every screen size.",
    image: "/landing/page-studio.jpg",
    accent: "#38bdf8",
  },
  {
    title: "Create content around your real offer",
    eyebrow: "Marketing room",
    description: "Plan practical campaigns, hooks, captions, videos, and sales conversations without starting from zero.",
    image: "/landing/marketing-room.jpg",
    accent: "#a78bfa",
  },
  {
    title: "Follow a clear path to your first sales",
    eyebrow: "Launch roadmap",
    description: "Move from setup to publishing and promotion with one useful next action at a time.",
    image: "/landing/launch-roadmap.jpg",
    accent: "#34d399",
  },
] as const;

export function ServiceCardShuffle() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (isShuffling) return;

    const timeout = window.setTimeout(() => setIsShuffling(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, isShuffling]);

  function finishShuffle() {
    setActiveIndex((current) => (current + 1) % services.length);
    setIsShuffling(false);
  }

  return (
    <div className="relative mx-auto h-[30rem] w-full max-w-xl sm:h-[33rem] lg:h-[31rem]">
      <div className="absolute left-1/2 top-1/2 h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute inset-x-3 bottom-3 top-3 sm:inset-x-7">
        {services.map((service, index) => {
          const position = (index - activeIndex + services.length) % services.length;
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
              className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-slate-950/10 bg-[#071426] text-white shadow-[0_35px_90px_-35px_rgba(7,20,38,.75)] transition-all duration-700 ease-out motion-reduce:transition-none ${transforms[position]}`}
              style={{ zIndex: services.length - position }}
              aria-hidden={position !== 0}
              onAnimationEnd={position === 0 && isShuffling ? finishShuffle : undefined}
            >
              <Image
                src={service.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,13,27,.08)_16%,rgba(4,13,27,.45)_54%,rgba(4,13,27,.97)_100%)]" />
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: service.accent }}
              />

              <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                    OnlineSkiller launch kit
                  </span>
                  <span className="rounded-full bg-black/25 px-2.5 py-1 font-mono text-[0.68rem] font-bold text-white/75 backdrop-blur-md">
                    0{index + 1} / 04
                  </span>
                </div>

                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: service.accent }}
                  >
                    {service.eyebrow}
                  </p>
                  <h2 className="mt-3 max-w-lg text-3xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/15 pt-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/80">
                      Built for real creator businesses <ArrowUpRight className="size-4" />
                    </span>
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
                            dotIndex === activeIndex ? "w-7 bg-white" : "w-1.5 bg-white/35"
                          }`}
                          aria-label={`Show ${item.title}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
