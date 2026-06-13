"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PageStudioNav({ pageId, pageType }: { pageId: string; pageType: string }) {
  const pathname = usePathname();
  const items = [
    ["Details", `/dashboard/pages/${pageId}/edit`],
    ["Sections", `/dashboard/pages/${pageId}/builder`],
    ["Videos", `/dashboard/pages/${pageId}/videos`],
    ...(pageType === "online-course" ? [["Lessons", `/dashboard/pages/${pageId}/lessons`]] : []),
    ["Payments", `/dashboard/pages/${pageId}/payments`],
    ["Customers", `/dashboard/pages/${pageId}/customers`],
    ["Preview", `/dashboard/pages/${pageId}/preview`],
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/pages"><ArrowLeft /> All pages</Link>
      </Button>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {items.map(([label, href]) => (
          <Button key={href} asChild variant={pathname === href ? "secondary" : "outline"} size="sm">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
