"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CreditCard, Files, LayoutDashboard, Megaphone } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/dashboard/pages", icon: Files },
  { label: "Market", href: "/dashboard/marketing", icon: Megaphone },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function MobileDashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-2 bottom-2 z-40 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.62rem] font-semibold",
                active ? "bg-blue-50 text-blue-700" : "text-slate-500",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
