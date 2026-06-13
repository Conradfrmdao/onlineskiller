import "server-only";

import { and, asc, count, eq, sql } from "drizzle-orm";

import {
  courseLessons,
  courseModules,
  creatorProfiles,
  customerRequests,
  pageEvents,
  pagePaymentMethods,
  pageSections,
  pages,
  pageVideos,
  subscriptions,
  templates,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";

export async function getPageStudioData(pageId: string, creatorId: string) {
  const pageRows = await db
    .select({ page: pages, template: templates })
    .from(pages)
    .leftJoin(templates, eq(templates.id, pages.templateId))
    .where(and(eq(pages.id, pageId), eq(pages.creatorId, creatorId)))
    .limit(1);

  if (!pageRows[0]) {
    return null;
  }

  const [sections, videos, modules, lessons, paymentMethods] = await Promise.all([
    db.select().from(pageSections).where(eq(pageSections.pageId, pageId)).orderBy(asc(pageSections.sortOrder)),
    db.select().from(pageVideos).where(eq(pageVideos.pageId, pageId)).orderBy(asc(pageVideos.sortOrder)),
    db.select().from(courseModules).where(eq(courseModules.pageId, pageId)).orderBy(asc(courseModules.sortOrder)),
    db.select().from(courseLessons).where(eq(courseLessons.pageId, pageId)).orderBy(asc(courseLessons.sortOrder)),
    db.select().from(pagePaymentMethods).where(eq(pagePaymentMethods.pageId, pageId)).orderBy(asc(pagePaymentMethods.sortOrder)),
  ]);

  return {
    ...pageRows[0],
    sections,
    videos,
    modules,
    lessons,
    paymentMethods,
  };
}

export async function getPublicPageBySlug(slug: string) {
  const rows = await db
    .select({
      page: pages,
      creator: creatorProfiles,
      template: templates,
      subscription: subscriptions,
      user: users,
    })
    .from(pages)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, pages.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .leftJoin(templates, eq(templates.id, pages.templateId))
    .leftJoin(subscriptions, eq(subscriptions.creatorId, creatorProfiles.id))
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!rows[0]) {
    return null;
  }

  const [sections, videos, modules, lessons, paymentMethods] = await Promise.all([
    db.select().from(pageSections).where(eq(pageSections.pageId, rows[0].page.id)).orderBy(asc(pageSections.sortOrder)),
    db.select().from(pageVideos).where(eq(pageVideos.pageId, rows[0].page.id)).orderBy(asc(pageVideos.sortOrder)),
    db.select().from(courseModules).where(eq(courseModules.pageId, rows[0].page.id)).orderBy(asc(courseModules.sortOrder)),
    db.select().from(courseLessons).where(eq(courseLessons.pageId, rows[0].page.id)).orderBy(asc(courseLessons.sortOrder)),
    db
      .select()
      .from(pagePaymentMethods)
      .where(eq(pagePaymentMethods.pageId, rows[0].page.id))
      .orderBy(asc(pagePaymentMethods.sortOrder)),
  ]);

  return { ...rows[0], sections, videos, modules, lessons, paymentMethods };
}

export async function getPageAnalytics(pageId: string) {
  const [views, ctas, requests] = await Promise.all([
    db
      .select({ total: count() })
      .from(pageEvents)
      .where(sql`${pageEvents.pageId} = ${pageId} and ${pageEvents.eventType} = 'view'`),
    db
      .select({ total: count() })
      .from(pageEvents)
      .where(sql`${pageEvents.pageId} = ${pageId} and ${pageEvents.eventType} = 'cta_click'`),
    db
      .select({ total: count() })
      .from(customerRequests)
      .where(eq(customerRequests.pageId, pageId)),
  ]);

  return {
    views: Number(views[0]?.total || 0),
    ctaClicks: Number(ctas[0]?.total || 0),
    requests: Number(requests[0]?.total || 0),
  };
}
