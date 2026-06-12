import "server-only";

import { eq } from "drizzle-orm";

import { pages } from "@/db/schema";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils/slugs";

export async function getPageSlugAvailability(value: string, excludePageId?: string) {
  const slug = slugify(value);
  const rows = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);
  const existing = rows[0];

  return {
    slug,
    available: !existing || existing.id === excludePageId,
  };
}
