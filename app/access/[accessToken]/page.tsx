import Link from "next/link";
import { eq } from "drizzle-orm";
import { BookOpen, CheckCircle2, Download, ExternalLink, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  courseLessons,
  courseModules,
  creatorProfiles,
  customerRequests,
  pages,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";
import { hasActiveCustomerAccess } from "@/lib/pages/customer-access";
import { getEmbedUrl } from "@/lib/pages/video-provider";

export const dynamic = "force-dynamic";

function AccessUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-4 text-white">
      <div className="max-w-md text-center">
        <LockKeyhole className="mx-auto size-12 text-blue-300" />
        <h1 className="mt-6 text-3xl font-bold">Access is not active.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The creator may still be confirming payment, preparing delivery, or may have revoked this access link.
        </p>
      </div>
    </main>
  );
}

export default async function CustomerAccessPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;
  const rows = await db
    .select({
      request: customerRequests,
      page: pages,
      creator: creatorProfiles,
      userStatus: users.status,
    })
    .from(customerRequests)
    .innerJoin(pages, eq(pages.id, customerRequests.pageId))
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, customerRequests.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .where(eq(customerRequests.accessToken, accessToken))
    .limit(1);
  const data = rows[0];

  if (!data) notFound();
  const active = hasActiveCustomerAccess({
    accessStatus: data.request.accessStatus,
    accessExpiresAt: data.request.accessExpiresAt,
    userStatus: data.userStatus,
    moderationStatus: data.page.moderationStatus,
  });

  if (!active) return <AccessUnavailable />;

  const [modules, lessons] = await Promise.all([
    db
      .select()
      .from(courseModules)
      .where(eq(courseModules.pageId, data.page.id))
      .orderBy(courseModules.sortOrder),
    db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.pageId, data.page.id))
      .orderBy(courseLessons.sortOrder),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <OnlineSkillerLogo />
          <Badge variant="success"><CheckCircle2 className="mr-1 size-3" /> Access approved</Badge>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Private customer access</p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">{data.page.title}</h1>
        <p className="mt-3 text-sm text-slate-600">
          Welcome, {data.request.customerName}. Provided by {data.creator.businessName}.
        </p>

        {data.request.creatorNote ? (
          <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="font-semibold text-blue-950">Message from the creator</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-blue-900">{data.request.creatorNote}</p>
          </section>
        ) : null}

        {data.request.deliveryUrl ? (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5">
            <Download className="size-6 text-emerald-700" />
            <h2 className="mt-4 text-xl font-bold">Your product or delivery link</h2>
            <Button asChild className="mt-4">
              <a href={data.request.deliveryUrl} target="_blank" rel="noreferrer">
                Open delivery <ExternalLink />
              </a>
            </Button>
          </section>
        ) : null}

        {data.page.pageType === "online-course" ? (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <BookOpen className="size-6 text-blue-700" />
              <h2 className="text-2xl font-bold">Course content</h2>
            </div>
            <div className="mt-6 space-y-6">
              {modules.map((module, moduleIndex) => (
                <article key={module.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Module {moduleIndex + 1}</p>
                    <h3 className="mt-2 text-xl font-bold">{module.title}</h3>
                    {module.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p> : null}
                    {module.content ? (
                      <div className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-7 text-slate-800">
                        {module.content}
                      </div>
                    ) : null}
                  </div>
                  <div className="divide-y divide-slate-200">
                    {lessons.filter((lesson) => lesson.moduleId === module.id).map((lesson, lessonIndex) => (
                      <details key={lesson.id} className="group p-5" open={lessonIndex === 0 && moduleIndex === 0}>
                        <summary className="cursor-pointer list-none font-semibold">
                          {lesson.title}
                          {lesson.duration ? <span className="ml-2 text-xs font-normal text-slate-500">{lesson.duration}</span> : null}
                        </summary>
                        {lesson.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.description}</p> : null}
                        {lesson.videoUrl ? (
                          <iframe
                            src={getEmbedUrl(lesson.videoUrl, lesson.videoProvider as never)}
                            title={lesson.title}
                            className="mt-5 aspect-video w-full rounded-xl"
                            allowFullScreen
                          />
                        ) : null}
                        {lesson.content ? (
                          <div className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-800">
                            {lesson.content}
                          </div>
                        ) : null}
                        {lesson.resourceUrl ? (
                          <Button asChild variant="outline" size="sm" className="mt-4">
                            <a href={lesson.resourceUrl} target="_blank" rel="noreferrer">
                              Open lesson resource <ExternalLink />
                            </a>
                          </Button>
                        ) : null}
                      </details>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-12 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500">
          This private link is intended for {data.request.customerName}. Contact the creator if you need help with your purchase.
        </p>
        <Button asChild variant="ghost" className="mt-3">
          <Link href={`/p/${data.page.slug}`}>Return to offer page</Link>
        </Button>
      </div>
    </main>
  );
}
