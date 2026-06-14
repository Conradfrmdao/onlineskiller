"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  marketingAssets,
  marketingCaptions,
  marketingStrategies,
  pages,
  platformSettings,
  subscriptions,
  templates,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";
import { addBillingMonth } from "@/lib/billing/periods";
import { isPlanName } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import type { TemplateConfig } from "@/lib/pages/types";
import { writeAuditLog } from "@/lib/utils/audit";
import { slugify } from "@/lib/utils/slugs";

export async function updateUserAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const role = formData.get("role") === "admin" ? "admin" : "creator";
  const status = formData.get("status") === "suspended" ? "suspended" : "active";
  await db.update(users).set({ role, status, updatedAt: new Date() }).where(eq(users.id, userId));
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: "user.updated", entityType: "user", entityId: userId, metadata: { role, status } });
  revalidatePath("/admin/users");
}

export async function pausePageAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const pageId = String(formData.get("pageId") || "");
  await db.update(pages).set({ status: "paused", isLive: false, updatedAt: new Date() }).where(eq(pages.id, pageId));
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: "page.paused", entityType: "page", entityId: pageId });
  revalidatePath("/admin/pages");
}

export async function moderatePageAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const pageId = String(formData.get("pageId") || "");
  const requestedAction = String(formData.get("moderationAction") || "take_down");
  const takeDown = requestedAction !== "restore";
  const moderationReason = String(formData.get("moderationReason") || "").trim().slice(0, 2000);

  await db
    .update(pages)
    .set({
      moderationStatus: takeDown ? "taken_down" : "active",
      moderationReason: takeDown ? moderationReason || "Removed by platform administration." : null,
      status: takeDown ? "taken_down" : "paused",
      isLive: false,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: admin.userId,
    action: takeDown ? "page.taken_down" : "page.restored",
    entityType: "page",
    entityId: pageId,
    metadata: { moderationReason },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/dashboard/pages");
}

function templateConfig(accent: string): TemplateConfig {
  return {
    theme: { background: "#f4f7fb", surface: "#ffffff", text: "#071426", muted: "#657086", accent },
    typography: "modern",
    heroLayout: "split",
    ctaPlacement: "both",
    sectionOrder: ["benefits", "who-it-is-for", "what-you-get", "pricing", "testimonials", "faq"],
    cardStyle: "outlined",
    footerStyle: "full",
    visualStyle: "minimal",
    buttonStyle: "rounded",
    sectionLayout: "cards",
    heroMediaShape: "landscape",
  };
}

export async function saveTemplateAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const templateId = String(formData.get("templateId") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 120);
  const description = String(formData.get("description") || "").trim().slice(0, 1000);
  const accent = /^#[0-9a-f]{6}$/i.test(String(formData.get("accent") || "")) ? String(formData.get("accent")) : "#1769ff";
  if (!name || !description) return;
  const values = {
    name,
    slug: slugify(String(formData.get("slug") || name)),
    description,
    pageType: String(formData.get("pageType") || "all").slice(0, 60),
    isPremium: formData.get("isPremium") === "on",
    isActive: formData.get("isActive") === "on",
    config: templateConfig(accent),
    updatedAt: new Date(),
  };

  if (templateId) {
    const currentRows = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
    const currentConfig = currentRows[0]?.config;
    if (currentConfig) {
      values.config = {
        ...currentConfig,
        theme: {
          ...currentConfig.theme,
          accent,
        },
      };
    }
    await db.update(templates).set(values).where(eq(templates.id, templateId));
  } else {
    await db.insert(templates).values(values);
  }
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: templateId ? "template.updated" : "template.created", entityType: "template", entityId: templateId || values.slug });
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
}

export async function saveMarketingAssetAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const assetId = String(formData.get("assetId") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  if (!title) return;
  const values = {
    title,
    description: String(formData.get("description") || "").trim().slice(0, 2000),
    category: String(formData.get("category") || "Online business").slice(0, 100),
    niche: String(formData.get("niche") || "all").slice(0, 100),
    tags: String(formData.get("tags") || "").split(",").map((item) => item.trim()).filter(Boolean),
    videoUrl: String(formData.get("videoUrl") || "").trim(),
    thumbnailUrl: String(formData.get("thumbnailUrl") || "").trim() || null,
    source: String(formData.get("source") || "").trim(),
    licenseType: String(formData.get("licenseType") || "").trim().slice(0, 120),
    duration: String(formData.get("duration") || "").slice(0, 30),
    orientation: String(formData.get("orientation") || "vertical").slice(0, 30),
    isPremium: formData.get("isPremium") === "on",
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };
  let savedId = assetId;
  if (assetId) {
    await db.update(marketingAssets).set(values).where(eq(marketingAssets.id, assetId));
  } else {
    const inserted = await db.insert(marketingAssets).values(values).returning({ id: marketingAssets.id });
    savedId = inserted[0]?.id || "";
  }
  if (savedId) {
    await db
      .insert(marketingCaptions)
      .values({
        assetId: savedId,
        hook: String(formData.get("hook") || ""),
        caption: String(formData.get("caption") || ""),
        hashtags: String(formData.get("hashtags") || ""),
        cta: String(formData.get("cta") || ""),
        voiceoverScript: String(formData.get("voiceoverScript") || ""),
      })
      .onConflictDoUpdate({
        target: marketingCaptions.assetId,
        set: {
          hook: String(formData.get("hook") || ""),
          caption: String(formData.get("caption") || ""),
          hashtags: String(formData.get("hashtags") || ""),
          cta: String(formData.get("cta") || ""),
          voiceoverScript: String(formData.get("voiceoverScript") || ""),
          updatedAt: new Date(),
        },
      });
  }
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: assetId ? "marketing_asset.updated" : "marketing_asset.created", entityType: "marketing_asset", entityId: savedId || title });
  revalidatePath("/admin/marketing-assets");
  revalidatePath("/dashboard/marketing");
}

export async function saveMarketingStrategyAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const strategyId = String(formData.get("strategyId") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  if (!title) return;
  const list = (name: string) => String(formData.get(name) || "").split("\n").map((item) => item.trim()).filter(Boolean);
  const values = {
    title,
    slug: slugify(String(formData.get("slug") || title)),
    category: String(formData.get("category") || "Launch strategy").slice(0, 100),
    description: String(formData.get("description") || "").trim(),
    steps: list("steps"),
    exampleCaptions: list("exampleCaptions"),
    examplePosts: list("examplePosts"),
    recommendedCta: String(formData.get("recommendedCta") || "").trim(),
    bestPlatform: String(formData.get("bestPlatform") || "").slice(0, 80),
    difficultyLevel: String(formData.get("difficultyLevel") || "beginner").slice(0, 30),
    recommendedPageType: String(formData.get("recommendedPageType") || "all").slice(0, 60),
    isPremium: formData.get("isPremium") === "on",
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };
  if (strategyId) {
    await db.update(marketingStrategies).set(values).where(eq(marketingStrategies.id, strategyId));
  } else {
    await db.insert(marketingStrategies).values(values);
  }
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: strategyId ? "marketing_strategy.updated" : "marketing_strategy.created", entityType: "marketing_strategy", entityId: strategyId || values.slug });
  revalidatePath("/admin/marketing-strategies");
  revalidatePath("/dashboard/marketing/strategies");
}

export async function updateSubscriptionAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const creatorId = String(formData.get("creatorId") || "");
  const requestedPlan = String(formData.get("planName") || "starter");
  const planName = isPlanName(requestedPlan) ? requestedPlan : "starter";
  const requestedStatus = String(formData.get("status") || "active");
  const status = ["active", "trialing", "inactive", "expired"].includes(requestedStatus)
    ? requestedStatus
    : "inactive";
  const months = Math.min(24, Math.max(1, Number(formData.get("months") || 1)));
  const periodMode = formData.get("periodMode") === "extend" ? "extend" : "replace";
  const existingRows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.creatorId, creatorId))
    .limit(1);
  const existing = existingRows[0];
  const now = new Date();
  const retainsAccess = status === "active" || status === "trialing";
  const canExtend =
    periodMode === "extend" &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now;
  const start = canExtend ? existing.currentPeriodStart || now : now;
  let end = canExtend ? existing.currentPeriodEnd! : now;
  for (let index = 0; index < months; index += 1) end = addBillingMonth(end);

  await db
    .insert(subscriptions)
    .values({
      creatorId,
      planName,
      provider: "manual",
      status,
      currentPeriodStart: retainsAccess ? start : null,
      currentPeriodEnd: retainsAccess ? end : null,
    })
    .onConflictDoUpdate({
      target: subscriptions.creatorId,
      set: {
        planName,
        provider: "manual",
        status,
        currentPeriodStart: retainsAccess ? start : null,
        currentPeriodEnd: retainsAccess ? end : null,
        recurringEnabled: false,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: "subscription.updated", entityType: "creator_profile", entityId: creatorId, metadata: { planName, status, months, periodMode } });
  revalidatePath("/admin/subscriptions");
  revalidatePath("/dashboard/billing");
}

export async function savePlatformSettingAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const key = slugify(String(formData.get("key") || "")).replaceAll("-", "_");
  const rawValue = String(formData.get("value") || "").trim();
  if (!key) return;
  await db
    .insert(platformSettings)
    .values({ key, value: { value: rawValue } })
    .onConflictDoUpdate({ target: platformSettings.key, set: { value: { value: rawValue }, updatedAt: new Date() } });
  await writeAuditLog(db, { actorType: "admin", actorId: admin.userId, action: "platform_setting.updated", entityType: "platform_setting", entityId: key });
  revalidatePath("/admin/settings");
}
