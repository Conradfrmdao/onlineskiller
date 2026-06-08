import "server-only";

import dns from "node:dns";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

dns.setDefaultResultOrder?.("ipv4first");

const databaseUrl =
  process.env.DATABASE_URL || "postgres://onlineskiller:onlineskiller@localhost:5432/onlineskiller";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
  console.warn("DATABASE_URL is missing. Database calls require a configured Neon/Postgres database.");
}

const client = postgres(databaseUrl, {
  max: 5,
  prepare: false,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type DbClient = typeof db;
