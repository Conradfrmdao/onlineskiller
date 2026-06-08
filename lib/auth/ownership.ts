import "server-only";

import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { pages } from "@/db/schema";
import { db } from "@/lib/db";

export async function getOwnedPage(pageId: string, creatorId: string) {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.creatorId, creatorId)))
    .limit(1);

  return rows[0] || null;
}

export async function requireOwnedPage(pageId: string, creatorId: string) {
  const page = await getOwnedPage(pageId, creatorId);

  if (!page) {
    notFound();
  }

  return page;
}
