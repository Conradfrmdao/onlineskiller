"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard } from "lucide-react";

export function VideoPreview({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.load();
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  function revealFirstFrame() {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = Math.min(0.15, video.duration || 0.15);
    } catch {
      setReady(true);
    }
  }

  function playPreview() {
    const video = videoRef.current;
    if (!video || failed) return;
    void video.play().catch(() => undefined);
  }

  function pausePreview() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_25%_15%,#2563eb_0,transparent_35%),linear-gradient(145deg,#071426,#14284a)]"
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
    >
      {!ready || failed ? (
        <div className="absolute inset-0 grid place-items-center text-center text-white">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10">
              <Clapperboard className="size-5" />
            </span>
            <p className="mt-3 max-w-44 px-3 text-xs font-semibold leading-5 text-slate-200">
              {failed ? "Preview unavailable. The download is still available." : title}
            </p>
          </div>
        </div>
      ) : null}
      {!failed ? (
        <video
          ref={videoRef}
          src={src}
          aria-label={`${title} video preview`}
          preload="none"
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={revealFirstFrame}
          onLoadedData={() => setReady(true)}
          onSeeked={() => setReady(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}
