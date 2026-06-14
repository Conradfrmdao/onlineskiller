"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Files,
  LayoutTemplate,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { cn } from "@/lib/utils";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My pages", href: "/dashboard/pages", icon: Files },
  { name: "Access requests", href: "/dashboard/access-requests", icon: UserRoundCheck },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-hidden border-r border-slate-200 bg-[#071426] text-white lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5">
          <OnlineSkillerLogo href="/dashboard" inverse />
        </div>
        <nav className="mt-4 flex-1 space-y-0.5">
          {items.map((item) => {
            const active = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.name}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              className="mt-3 flex items-center gap-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/20"
            >
              <ShieldCheck className="size-4" />
              Admin console
            </Link>
          ) : null}
        </nav>
        <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-300" />
            <p className="text-sm font-semibold">One clear next step</p>
          </div>
          <p className="mt-1.5 text-xs leading-4 text-slate-300">Build the page, share the offer, then improve it from real feedback.</p>
        </div>
      </div>
    </aside>
  );
}
