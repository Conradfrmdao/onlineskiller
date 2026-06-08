"use client";

import { useEffect } from "react";

export function ViewTracker({ pageId }: { pageId: string }) {
  useEffect(() => {
    void fetch("/api/events/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId,
        eventType: "view",
        referrer: document.referrer,
      }),
      keepalive: true,
    });
  }, [pageId]);

  return null;
}

export function TrackedCta({
  pageId,
  href,
  children,
  className,
  newTab = true,
}: {
  pageId: string;
  href: string;
  children: React.ReactNode;
  className?: string;
  newTab?: boolean;
}) {
  function track() {
    const body = JSON.stringify({ pageId, eventType: "cta_click", referrer: document.referrer });
    navigator.sendBeacon?.("/api/events/page", new Blob([body], { type: "application/json" }));
  }

  return (
    <a
      href={href}
      onClick={track}
      className={className}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
