import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";
import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { users } from "../db/schema";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;
const secretKey = process.env.CLERK_SECRET_KEY;

if (!email || !password) {
  throw new Error("ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required.");
}

if (!databaseUrl || !secretKey) {
  throw new Error("DATABASE_URL and CLERK_SECRET_KEY are required.");
}

const adminEmail = email;
const adminPassword = password;
const neonUrl = databaseUrl;
const clerkSecretKey = secretKey;

async function main() {
  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const existing = await clerk.users.getUserList({ emailAddress: [adminEmail], limit: 2 });
  const current = existing.data[0];

  const clerkUser = current
    ? await clerk.users.updateUser(current.id, {
        password: adminPassword,
        signOutOfOtherSessions: true,
        publicMetadata: {
          ...current.publicMetadata,
          role: "admin",
        },
      })
    : await clerk.users.createUser({
        emailAddress: [adminEmail],
        password: adminPassword,
        firstName: "OnlineSkiller",
        lastName: "Admin",
        publicMetadata: { role: "admin" },
      });

  const sql = postgres(neonUrl, { max: 1, prepare: false });
  const db = drizzle(sql);

  try {
    await db
      .update(users)
      .set({ role: "admin", status: "active", updatedAt: new Date() })
      .where(or(eq(users.clerkUserId, clerkUser.id), eq(users.email, adminEmail)));
  } finally {
    await sql.end();
  }

  console.log(`Admin account ready for ${adminEmail} (${clerkUser.id}).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
