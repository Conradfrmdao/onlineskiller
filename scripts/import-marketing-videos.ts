import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { marketingAssets } from "../db/schema";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required.");

const roots = process.argv.slice(2);
if (!roots.length) {
  throw new Error("Pass one or more video folders after `--`.");
}

const sql = postgres(databaseUrl, { max: 5, prepare: false });
const db = drizzle(sql);

async function listVideos(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) return listVideos(fullPath);
      return entry.isFile() && path.extname(entry.name).toLowerCase() === ".mp4"
        ? [fullPath]
        : [];
    }),
  );
  return files.flat();
}

async function fileHash(filePath: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

function collectionName(root: string, index: number) {
  const name = path.basename(root).toLowerCase();
  return name.includes("larp_vids") ? "Viral LARP clips" : `LARP collection ${index + 1}`;
}

async function main() {
  try {
    const existing = await db.select({ source: marketingAssets.source }).from(marketingAssets);
    const existingSources = new Set(existing.map((row) => row.source));
    const seenHashes = new Set<string>();
    let uploaded = 0;
    let skipped = 0;
    const tasks: Array<{
      filePath: string;
      title: string;
      collection: string;
    }> = [];
    for (const [rootIndex, root] of roots.entries()) {
      const files = (await listVideos(root)).sort((left, right) =>
        left.localeCompare(right, undefined, { numeric: true }),
      );
      const collection = collectionName(root, rootIndex);

      for (const [fileIndex, filePath] of files.entries()) {
        tasks.push({
          filePath,
          collection,
          title: `${collection.replace(" clips", "")} ${String(fileIndex + 1).padStart(3, "0")}`,
        });
      }
    }

    let nextTask = 0;
    async function worker() {
      while (nextTask < tasks.length) {
        const task = tasks[nextTask];
        nextTask += 1;
        const { filePath, collection, title } = task;
        const hash = await fileHash(filePath);
        const source = `user-upload:${hash}`;
        if (seenHashes.has(hash) || existingSources.has(source)) {
          skipped += 1;
          continue;
        }
        seenHashes.add(hash);

        const fileStats = await stat(filePath);
        const blob = await put(
          `marketing/larp/${hash}.mp4`,
          createReadStream(filePath),
          {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: "video/mp4",
            multipart: true,
          },
        );

        await db.insert(marketingAssets).values({
          title,
          description: "A ready-to-download short-form clip from the creator-provided LARP media collection.",
          category: collection,
          niche: "Short-form content",
          tags: ["larp", "short-form", "viral clip", "creator media"],
          videoUrl: blob.url,
          downloadUrl: blob.downloadUrl,
          thumbnailUrl: null,
          source,
          licenseType: "User-provided media - verify commercial usage rights before publishing",
          duration: `${Math.max(1, Math.round(fileStats.size / 1024 / 1024))} MB`,
          orientation: "vertical",
          isPremium: false,
          isActive: true,
        });

        existingSources.add(source);
        uploaded += 1;
        console.log(`[${uploaded}] Uploaded ${path.basename(filePath)}`);
      }
    }

    await Promise.all(Array.from({ length: 4 }, () => worker()));
    console.log(`Import complete: ${uploaded} uploaded, ${skipped} duplicates skipped.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
