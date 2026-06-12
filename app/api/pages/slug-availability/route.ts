import { NextResponse } from "next/server";

import { requireCreatorApi } from "@/lib/auth/user";
import { getPageSlugAvailability } from "@/lib/pages/slug-availability";

export async function GET(request: Request) {
  try {
    await requireCreatorApi();
  } catch {
    return NextResponse.json({ available: false, message: "Sign in required." }, { status: 401 });
  }

  const value = new URL(request.url).searchParams.get("slug") || "";
  if (value.trim().length < 2) {
    return NextResponse.json({ available: false, slug: "", message: "Add at least two characters." });
  }

  const result = await getPageSlugAvailability(value);
  return NextResponse.json(result);
}
