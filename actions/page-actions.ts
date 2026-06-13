"use server";

import { and, asc, count, eq, max, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  courseLessons,
  courseModules,
  creatorProfiles,
  pageSections,
  pages,
  pageVideos,
  templates,
} from "@/db/schema";
import { requireOwnedPage } from "@/lib/auth/ownership";
import { requireCreator } from "@/lib/auth/user";
import { hasValidAccess } from "@/lib/billing/periods";
import { canPublishAnotherPage } from "@/lib/billing/entitlements";
import { getPlan } from "@/lib/billing/plans";
import { getCreatorSubscription } from "@/lib/billing/subscription";
import { db } from "@/lib/db";
import {
  getLaunchGoal,
  getLaunchScore,
  getStarterSections,
  resolveLaunchCta,
} from "@/lib/pages/launch-flow";
import { getPageSlugAvailability } from "@/lib/pages/slug-availability";
import { detectVideoProvider } from "@/lib/pages/video-provider";
import { createPageSchema, sectionSchema, updatePageSchema, videoSchema } from "@/lib/validation/page.schema";
import { cleanHttpUrl } from "@/lib/utils/urls";

type ActionState = {
  success: boolean;
  message: string;
};

function isUniqueConstraintError(error: unknown) {
  let current = error;

  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth += 1) {
    if ("code" in current && current.code === "23505") {
      return true;
    }
    current = "cause" in current ? current.cause : null;
  }

  return false;
}

async function templateAllowed(templateId: string | undefined, creatorId: string) {
  if (!templateId) {
    return null;
  }

  const rows = await db.select().from(templates).where(and(eq(templates.id, templateId), eq(templates.isActive, true))).limit(1);
  const template = rows[0];

  if (!template) {
    throw new Error("Template not found.");
  }

  if (template.isPremium) {
    const subscription = await getCreatorSubscription(creatorId);
    const plan = getPlan(subscription?.planName);

    if (!hasValidAccess(subscription) || !plan.premiumTemplates) {
      throw new Error("Upgrade to Growth or Pro to use this premium template.");
    }
  }

  return template;
}

export async function createPageAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCreator();
  const parsed = createPageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check your page details." };
  }

  try {
    await templateAllowed(parsed.data.templateId || undefined, profile.id);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Template is unavailable." };
  }

  const goal = getLaunchGoal(parsed.data.launchGoal);
  if (goal.needsDestination && !cleanHttpUrl(parsed.data.ctaDestination)) {
    return { success: false, message: "Add a valid destination link for your main button." };
  }

  const cta = resolveLaunchCta(
    parsed.data.launchGoal,
    parsed.data.ctaDestination,
    profile,
    parsed.data.title,
  );
  if (!cta.ctaUrl) {
    return {
      success: false,
      message:
        parsed.data.launchGoal === "whatsapp"
          ? "Add a WhatsApp number in Settings before using the WhatsApp goal."
          : "Add an Instagram handle in Settings before using the Instagram goal.",
    };
  }

  const slugAvailability = await getPageSlugAvailability(parsed.data.slug);
  if (!slugAvailability.available) {
    return {
      success: false,
      message: `The address /p/${slugAvailability.slug} is already taken. Choose another one.`,
    };
  }

  const slug = slugAvailability.slug;
  const introVideoUrl = cleanHttpUrl(parsed.data.introVideoUrl);
  const heroImageUrl = cleanHttpUrl(parsed.data.heroImageUrl);
  const logoUrl = cleanHttpUrl(parsed.data.logoUrl);
  let inserted: typeof pages.$inferSelect;

  try {
    inserted = await db.transaction(async (tx) => {
      const pageRows = await tx
        .insert(pages)
        .values({
          creatorId: profile.id,
          title: parsed.data.title,
          slug,
          pageType: parsed.data.pageType,
          templateId: parsed.data.templateId || null,
          subtitle: parsed.data.description,
          description: `Explore ${parsed.data.title} from ${profile.businessName} and take the next clear step.`,
          category: parsed.data.category,
          priceText: parsed.data.priceText,
          ctaText: cta.ctaText,
          ctaUrl: cta.ctaUrl,
          whatsappEnabled: cta.whatsappEnabled,
          heroImageUrl: heroImageUrl || null,
          introVideoUrl: introVideoUrl || null,
          introVideoProvider: introVideoUrl ? detectVideoProvider(introVideoUrl) : null,
        })
        .returning();
      const page = pageRows[0];

      if (!page) {
        throw new Error("Page could not be created.");
      }

      if (logoUrl && logoUrl !== profile.logoUrl) {
        await tx
          .update(creatorProfiles)
          .set({ logoUrl, updatedAt: new Date() })
          .where(eq(creatorProfiles.id, profile.id));
      }

      await tx.insert(pageSections).values(
        getStarterSections(
          parsed.data.pageType,
          parsed.data.title,
          parsed.data.description,
          parsed.data.category,
        ).map((section, index) => ({
          pageId: page.id,
          sectionType: section.type,
          title: section.title,
          content: section.content,
          sortOrder: index,
          isVisible: section.isVisible ?? true,
        })),
      );

      return page;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        message: `The address /p/${slug} was just taken. Choose another one.`,
      };
    }
    throw error;
  }

  redirect(`/dashboard/pages/${inserted.id}/builder?created=1`);
}

export async function updatePageAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const current = await requireOwnedPage(pageId, profile.id);
  const parsed = updatePageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check your page details." };
  }

  try {
    await templateAllowed(parsed.data.templateId || undefined, profile.id);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Template is unavailable." };
  }

  const slugAvailability = await getPageSlugAvailability(parsed.data.slug, current.id);
  if (!slugAvailability.available) {
    return {
      success: false,
      message: `The address /p/${slugAvailability.slug} is already taken. Choose another one.`,
    };
  }

  const slug = slugAvailability.slug;
  const introUrl = cleanHttpUrl(parsed.data.introVideoUrl);

  await db
    .update(pages)
    .set({
      title: parsed.data.title,
      slug,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      pageType: parsed.data.pageType,
      category: parsed.data.category,
      priceText: parsed.data.priceText,
      ctaText: parsed.data.ctaText,
      ctaUrl: cleanHttpUrl(parsed.data.ctaUrl) || null,
      heroImageUrl: cleanHttpUrl(parsed.data.heroImageUrl) || null,
      introVideoUrl: introUrl || null,
      introVideoProvider: introUrl ? detectVideoProvider(introUrl) : null,
      templateId: parsed.data.templateId || null,
      whatsappEnabled: formData.get("whatsappEnabled") === "on",
      updatedAt: new Date(),
    })
    .where(and(eq(pages.id, pageId), eq(pages.creatorId, profile.id)));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/dashboard/pages/${pageId}/preview`);
  if (current.slug !== slug) {
    revalidatePath(`/p/${current.slug}`);
  }
  revalidatePath(`/p/${slug}`);
  return { success: true, message: "Page details saved." };
}

function parseItems(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...description] = line.split("|");
      return { title: title.trim(), description: description.join("|").trim() };
    })
    .slice(0, 20);
}

export async function addSectionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  const parsed = sectionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check the section." };
  }

  const subscription = await getCreatorSubscription(profile.id);
  const plan = getPlan(subscription?.planName);
  const basicSections = ["benefits", "what-you-get", "who-it-is-for", "testimonials", "faq"];

  if (!basicSections.includes(parsed.data.sectionType) && (!hasValidAccess(subscription) || !plan.advancedSections)) {
    return { success: false, message: "Upgrade to Growth or Pro to add advanced sections." };
  }

  const maxRows = await db.select({ value: max(pageSections.sortOrder) }).from(pageSections).where(eq(pageSections.pageId, pageId));
  const nextOrder = Number(maxRows[0]?.value ?? -1) + 1;

  await db.insert(pageSections).values({
    pageId,
    sectionType: parsed.data.sectionType,
    title: parsed.data.title,
    content: {
      body: parsed.data.body,
      items: parseItems(parsed.data.items),
    },
    sortOrder: nextOrder,
  });

  revalidatePath(`/dashboard/pages/${pageId}/builder`);
  return { success: true, message: "Section added." };
}

export async function updateSectionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const sectionId = String(formData.get("sectionId") || "");
  await requireOwnedPage(pageId, profile.id);
  const parsed = sectionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check the section." };
  }

  await db
    .update(pageSections)
    .set({
      sectionType: parsed.data.sectionType,
      title: parsed.data.title,
      content: { body: parsed.data.body, items: parseItems(parsed.data.items) },
      isVisible: formData.get("isVisible") === "on",
      updatedAt: new Date(),
    })
    .where(and(eq(pageSections.id, sectionId), eq(pageSections.pageId, pageId)));

  revalidatePath(`/dashboard/pages/${pageId}/builder`);
  revalidatePath(`/dashboard/pages/${pageId}/preview`);
  return { success: true, message: "Section updated." };
}

export async function moveSectionAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const sectionId = String(formData.get("sectionId") || "");
  const direction = String(formData.get("direction") || "");
  await requireOwnedPage(pageId, profile.id);
  const sections = await db.select().from(pageSections).where(eq(pageSections.pageId, pageId)).orderBy(asc(pageSections.sortOrder));
  const index = sections.findIndex((section) => section.id === sectionId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || swapIndex < 0 || swapIndex >= sections.length) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx.update(pageSections).set({ sortOrder: -1 }).where(eq(pageSections.id, sections[index].id));
    await tx.update(pageSections).set({ sortOrder: sections[index].sortOrder }).where(eq(pageSections.id, sections[swapIndex].id));
    await tx.update(pageSections).set({ sortOrder: sections[swapIndex].sortOrder }).where(eq(pageSections.id, sections[index].id));
  });

  revalidatePath(`/dashboard/pages/${pageId}/builder`);
}

export async function deleteSectionAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const sectionId = String(formData.get("sectionId") || "");
  await requireOwnedPage(pageId, profile.id);
  await db.delete(pageSections).where(and(eq(pageSections.id, sectionId), eq(pageSections.pageId, pageId)));
  revalidatePath(`/dashboard/pages/${pageId}/builder`);
}

export async function addVideoAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  const parsed = videoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check the video." };
  }

  await db.insert(pageVideos).values({
    pageId,
    title: parsed.data.title,
    description: parsed.data.description,
    videoUrl: parsed.data.videoUrl,
    videoProvider: detectVideoProvider(parsed.data.videoUrl),
    duration: parsed.data.duration,
    isPreview: formData.get("isPreview") === "on",
    sortOrder: parsed.data.sortOrder,
  });
  revalidatePath(`/dashboard/pages/${pageId}/videos`);
  return { success: true, message: "Video added." };
}

export async function deleteVideoAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  await db.delete(pageVideos).where(and(eq(pageVideos.id, String(formData.get("videoId") || "")), eq(pageVideos.pageId, pageId)));
  revalidatePath(`/dashboard/pages/${pageId}/videos`);
}

export async function addModuleAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  const title = String(formData.get("title") || "").trim().slice(0, 180);

  if (!title) {
    return;
  }

  const rows = await db.select({ total: count() }).from(courseModules).where(eq(courseModules.pageId, pageId));
  await db.insert(courseModules).values({ pageId, title, sortOrder: Number(rows[0]?.total || 0) });
  revalidatePath(`/dashboard/pages/${pageId}/lessons`);
}

export async function addLessonAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  const moduleId = String(formData.get("moduleId") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const videoUrl = cleanHttpUrl(String(formData.get("videoUrl") || ""));

  if (!title || !moduleId) {
    return;
  }

  const moduleRows = await db
    .select()
    .from(courseModules)
    .where(and(eq(courseModules.id, moduleId), eq(courseModules.pageId, pageId)))
    .limit(1);

  if (!moduleRows[0]) {
    return;
  }

  const lessonRows = await db.select({ total: count() }).from(courseLessons).where(eq(courseLessons.moduleId, moduleId));
  await db.insert(courseLessons).values({
    moduleId,
    pageId,
    title,
    description: String(formData.get("description") || "").trim().slice(0, 1000),
    videoUrl: videoUrl || null,
    videoProvider: videoUrl ? detectVideoProvider(videoUrl) : null,
    resourceUrl: cleanHttpUrl(String(formData.get("resourceUrl") || "")) || null,
    duration: String(formData.get("duration") || "").trim().slice(0, 30),
    isPreview: formData.get("isPreview") === "on",
    sortOrder: Number(lessonRows[0]?.total || 0),
  });
  revalidatePath(`/dashboard/pages/${pageId}/lessons`);
}

export async function deleteModuleAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  await db.delete(courseModules).where(and(eq(courseModules.id, String(formData.get("moduleId") || "")), eq(courseModules.pageId, pageId)));
  revalidatePath(`/dashboard/pages/${pageId}/lessons`);
}

export async function deleteLessonAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  await db.delete(courseLessons).where(and(eq(courseLessons.id, String(formData.get("lessonId") || "")), eq(courseLessons.pageId, pageId)));
  revalidatePath(`/dashboard/pages/${pageId}/lessons`);
}

export async function publishPageAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const page = await requireOwnedPage(pageId, profile.id);
  const subscription = await getCreatorSubscription(profile.id);
  const [readinessSections, readinessVideos] = await Promise.all([
    db.select().from(pageSections).where(eq(pageSections.pageId, pageId)),
    db.select().from(pageVideos).where(eq(pageVideos.pageId, pageId)),
  ]);
  const readiness = getLaunchScore({
    page,
    sections: readinessSections,
    videos: readinessVideos,
  });

  if (!readiness.publishReady) {
    redirect(`/dashboard/pages/${pageId}/builder?reason=publish-blocked`);
  }

  if (!hasValidAccess(subscription)) {
    redirect(`/dashboard/billing?returnTo=/dashboard/pages/${pageId}/preview&reason=publish`);
  }

  const plan = getPlan(subscription?.planName);
  if (page.templateId) {
    const templateRows = await db.select().from(templates).where(eq(templates.id, page.templateId)).limit(1);
    if (templateRows[0]?.isPremium && !plan.premiumTemplates) {
      redirect(`/dashboard/billing?reason=premium-template`);
    }
  }
  const liveRows = await db
    .select({ total: count() })
    .from(pages)
    .where(and(eq(pages.creatorId, profile.id), eq(pages.isLive, true), ne(pages.id, pageId)));

  if (!canPublishAnotherPage(plan, Number(liveRows[0]?.total || 0))) {
    redirect(`/dashboard/billing?reason=limit`);
  }

  await db
    .update(pages)
    .set({ status: "live", isLive: true, publishedAt: page.publishedAt || new Date(), updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), eq(pages.creatorId, profile.id)));
  revalidatePath(`/dashboard/pages/${pageId}/preview`);
  revalidatePath(`/p/${page.slug}`);
  redirect(`/dashboard/pages/${pageId}/published`);
}

export async function pausePageAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const page = await requireOwnedPage(pageId, profile.id);
  await db
    .update(pages)
    .set({ status: "paused", isLive: false, updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), eq(pages.creatorId, profile.id)));
  revalidatePath(`/dashboard/pages/${pageId}/preview`);
  revalidatePath(`/p/${page.slug}`);
}

export async function deletePageAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  await requireOwnedPage(pageId, profile.id);
  await db.delete(pages).where(and(eq(pages.id, pageId), eq(pages.creatorId, profile.id)));
  revalidatePath("/dashboard/pages");
}
