import * as React from "react";

import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "success" | "warning" | "destructive" }) {
  const variants = {
    default: "border-blue-200 bg-blue-50 text-blue-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    destructive: "border-red-200 bg-red-50 text-red-950",
  };

  return <div role="alert" className={cn("rounded-xl border p-3 text-sm", variants[variant], className)} {...props} />;
}
