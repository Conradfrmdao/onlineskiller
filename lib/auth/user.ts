import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { creatorProfiles, users } from "@/db/schema";
import { db } from "@/lib/db";

function bestName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return "OnlineSkiller Creator";
  }

  return (
    user.fullName ||
    user.username ||
    user.firstName ||
    user.emailAddresses[0]?.emailAddress ||
    "OnlineSkiller Creator"
  );
}

export async function getOrCreateUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const existingRows = await db
    .select({
      user: users,
      profile: creatorProfiles,
    })
    .from(users)
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (existingRows[0]) {
    return existingRows[0];
  }

  const clerkUser = await currentUser();
  const inserted = await db
    .insert(users)
    .values({
      clerkUserId: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
      name: bestName(clerkUser),
    })
    .onConflictDoNothing({ target: users.clerkUserId })
    .returning();

  let user = inserted[0];

  if (!user) {
    const rows = await db.select().from(users).where(eq(users.clerkUserId, userId)).limit(1);
    user = rows[0];
  }

  if (!user) {
    throw new Error("User record could not be created.");
  }

  return {
    user,
    profile: null,
  };
}

export async function requireUser() {
  const context = await getOrCreateUser();

  if (!context) {
    redirect("/sign-in");
  }

  if (context.user.status !== "active") {
    redirect("/account-suspended");
  }

  return context;
}

export async function requireCreator(options?: { allowIncompleteOnboarding?: boolean }) {
  const context = await requireUser();

  if (!context.profile && !options?.allowIncompleteOnboarding) {
    redirect("/dashboard/onboarding");
  }

  if (context.profile && !context.profile.onboardingCompleted && !options?.allowIncompleteOnboarding) {
    redirect("/dashboard/onboarding");
  }

  return context as typeof context & {
    profile: NonNullable<typeof context.profile>;
  };
}

export async function requireCreatorApi() {
  const context = await getOrCreateUser();

  if (!context || !context.profile?.onboardingCompleted) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    user: context.user,
    profile: context.profile,
  };
}
