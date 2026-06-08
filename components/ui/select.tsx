import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10",
        className,
      )}
      {...props}
    />
  );
}
