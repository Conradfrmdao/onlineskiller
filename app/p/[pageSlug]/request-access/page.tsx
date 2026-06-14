import { redirect } from "next/navigation";

export default async function RequestAccessAliasPage({
  params,
}: {
  params: Promise<{ pageSlug: string }>;
}) {
  const { pageSlug } = await params;
  redirect(`/p/${pageSlug}/request`);
}
