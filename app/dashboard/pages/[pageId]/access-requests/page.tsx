import { redirect } from "next/navigation";

export default async function PageAccessRequestsAlias({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  redirect(`/dashboard/pages/${pageId}/customers`);
}
