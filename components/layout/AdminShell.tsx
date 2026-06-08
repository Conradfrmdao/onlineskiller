"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CreditCard, Files, LayoutDashboard, LayoutTemplate, Megaphone, Settings, Users } from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { cn } from "@/lib/utils";

const items = [
  ["Overview", "/admin", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Pages", "/admin/pages", Files],
  ["Templates", "/admin/templates", LayoutTemplate],
  ["Assets", "/admin/marketing-assets", Megaphone],
  ["Strategies", "/admin/marketing-strategies", Megaphone],
  ["Subscriptions", "/admin/subscriptions", CreditCard],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-100 lg:pl-72">
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-[#071426] p-5 text-white lg:block">
        <OnlineSkillerLogo href="/admin" inverse />
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-300">Admin console</p>
        <nav className="mt-8 space-y-1">
          {items.map(([label, href, Icon]) => (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", pathname === href ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="absolute bottom-6 left-5 right-5 rounded-xl border border-white/15 px-4 py-2 text-center text-sm text-slate-300 hover:bg-white/10">Creator dashboard</Link>
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">OnlineSkiller</p><p className="text-sm font-semibold">Administration</p></div>
        <UserButton />
      </header>
      <main className="px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1500px]">{children}</div></main>
    </div>
  );
}
