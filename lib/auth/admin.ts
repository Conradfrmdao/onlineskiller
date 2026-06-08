import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { db } from "@/lib/db";

function configuredAdminIds() {
  return (process.env.ADMIN_CLERK_USER_ID || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function getAdminUserId() {
  const result = await auth();
  const userId = result.userId;

  if (!userId) {
    return null;
  }

  const claims = result.sessionClaims as Record<string, unknown> | null;
  const metadata = (claims?.metadata || claims?.publicMetadata || {}) as Record<string, unknown>;

  if (metadata.role === "admin" || configuredAdminIds().includes(userId)) {
    return userId;
  }

  const rows = await db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  return rows[0]?.role === "admin" && rows[0]?.status === "active" ? userId : null;
}

export async function requireAdmin() {
  const userId = await getAdminUserId();

  if (!userId) {
    redirect("/dashboard");
  }

  return { userId };
}

export async function requireAdminApi() {
  const userId = await getAdminUserId();

  if (!userId) {
    throw new Error("FORBIDDEN");
  }

  return { userId };
}
