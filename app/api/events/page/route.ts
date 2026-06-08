import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { creatorProfiles, pageEvents, pages, subscriptions, users } from "@/db/schema";
import { hasValidAccess } from "@/lib/billing/periods";
import { db } from "@/lib/db";

function userAgentFamily(value: string) {
  const agent = value.toLowerCase();
  if (agent.includes("edg/")) return "Edge";
  if (agent.includes("chrome/")) return "Chrome";
  if (agent.includes("safari/")) return "Safari";
  if (agent.includes("firefox/")) return "Firefox";
  return "Other";
}

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pageId = typeof input.pageId === "string" ? input.pageId : "";
  const eventType = input.eventType === "cta_click" ? "cta_click" : input.eventType === "view" ? "view" : "";

  if (!pageId || !eventType) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pageRows = await db
    .select({ id: pages.id, subscription: subscriptions, userStatus: users.status })
    .from(pages)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, pages.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .leftJoin(subscriptions, eq(subscriptions.creatorId, creatorProfiles.id))
    .where(and(eq(pages.id, pageId), eq(pages.isLive, true), eq(pages.status, "live")))
    .limit(1);
  if (!pageRows[0] || pageRows[0].userStatus !== "active" || !hasValidAccess(pageRows[0].subscription)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let referrerHost = "";
  if (typeof input.referrer === "string" && input.referrer) {
    try {
      referrerHost = new URL(input.referrer).hostname.slice(0, 255);
    } catch {
      referrerHost = "";
    }
  }

  await db.insert(pageEvents).values({
    pageId,
    eventType,
    referrerHost: referrerHost || null,
    userAgentFamily: userAgentFamily(request.headers.get("user-agent") || ""),
  });

  return NextResponse.json({ ok: true });
}
