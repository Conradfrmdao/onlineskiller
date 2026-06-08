import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold transition-all duration-200 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(23,105,255,.9)] hover:-translate-y-0.5 hover:bg-[#0d58dd]",
        secondary: "border-blue-100 bg-blue-50 text-blue-950 hover:bg-blue-100",
        outline: "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50",
        ghost: "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        destructive: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        gold: "border-amber-300 bg-amber-300 text-slate-950 hover:bg-amber-400",
        link: "border-transparent p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
