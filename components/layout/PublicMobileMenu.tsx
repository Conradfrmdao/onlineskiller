"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Menu, X } from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Home", href: "/#top" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
];

export function PublicMobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const menu = open ? (
    <div id="public-mobile-menu" className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <div className="absolute inset-x-3 top-3 rounded-3xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <OnlineSkillerLogo />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </Button>
        </div>
        <nav className="mt-5 grid gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-semibold text-slate-800 hover:bg-slate-100"
            >
              {item.label}
              <ArrowRight className="size-4 text-slate-400" />
            </Link>
          ))}
        </nav>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
          {signedIn ? (
            <Button asChild className="col-span-2">
              <Link href="/dashboard" onClick={() => setOpen(false)}>Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up" onClick={() => setOpen(false)}>Start building</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="public-mobile-menu"
      >
        <Menu /> Menu
      </Button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
