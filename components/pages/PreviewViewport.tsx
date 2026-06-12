"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreviewViewport({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("mobile");

  return (
    <div className="bg-slate-100 px-2 pb-10 pt-4 sm:px-5">
      <div className="mx-auto mb-4 flex w-fit items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <Button
          type="button"
          size="sm"
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          onClick={() => setViewport("mobile")}
        >
          <Smartphone /> Mobile
        </Button>
        <Button
          type="button"
          size="sm"
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          onClick={() => setViewport("desktop")}
        >
          <Monitor /> Desktop
        </Button>
      </div>
      <div
        className={cn(
          "mx-auto overflow-hidden bg-white transition-all duration-300",
          viewport === "mobile"
            ? "max-w-[390px] rounded-[2rem] border-[8px] border-slate-900 shadow-2xl"
            : "max-w-[1440px] rounded-2xl border border-slate-200 shadow-xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}
