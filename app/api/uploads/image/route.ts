import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireCreatorApi } from "@/lib/auth/user";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  let profile;

  try {
    ({ profile } = await requireCreatorApi());
  } catch {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const purpose = String(formData.get("purpose") || "image")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()
    .slice(0, 30);

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Use a JPG, PNG, WebP, or AVIF image." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "Images must be smaller than 4 MB." },
      { status: 400 },
    );
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  const blob = await put(
    `creator-media/${profile.id}/${purpose}-${crypto.randomUUID()}.${extension}`,
    file,
    {
      access: "public",
      addRandomSuffix: false,
    },
  );

  return NextResponse.json({ url: blob.url });
}
