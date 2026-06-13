"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CreditCard,
  Files,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Megaphone,
  Plus,
  Settings,
  X,
} from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My pages", href: "/dashboard/pages", icon: Files },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isCurrent(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileDashboardMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = open ? (
    <div id="dashboard-mobile-menu" className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col bg-[#071426] p-4 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <OnlineSkillerLogo href="/dashboard" inverse />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Close workspace menu"
          >
            <X />
          </Button>
        </div>

        <Button asChild className="mt-6">
          <Link href="/dashboard/pages/new" onClick={() => setOpen(false)}>
            <Plus /> Create new page
          </Link>
        </Button>

        <nav className="mt-5 grid gap-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  ) : null;

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="dashboard-mobile-menu"
        aria-label="Open workspace menu"
      >
        <Menu /> Menu
      </Button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
