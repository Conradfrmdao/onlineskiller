import { notFound } from "next/navigation";
import { BookOpen, Trash2 } from "lucide-react";

import {
  addLessonAction,
  addModuleAction,
  deleteLessonAction,
  deleteModuleAction,
} from "@/actions/page-actions";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function LessonsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const data = await getPageStudioData(pageId, profile.id);
  if (!data || data.page.pageType !== "online-course") notFound();

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Course structure" title={data.page.title} description="Organize embedded lessons into simple public curriculum modules." />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />
      <form action={addModuleAction} className="panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
        <input type="hidden" name="pageId" value={pageId} />
        <Input name="title" placeholder="New module title" required />
        <Button type="submit">Add module</Button>
      </form>
      {data.modules.length === 0 ? (
        <div className="panel rounded-2xl p-10 text-center">
          <BookOpen className="mx-auto size-8 text-blue-600" />
          <p className="mt-3 font-semibold">Add your first course module.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {data.modules.map((module, moduleIndex) => (
            <section key={module.id} className="panel rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                  <h2 className="mt-2 text-lg font-semibold">{module.title}</h2>
                </div>
                <form action={deleteModuleAction}>
                  <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="moduleId" value={module.id} />
                  <Button type="submit" size="icon" variant="destructive" aria-label="Delete module"><Trash2 /></Button>
                </form>
              </div>
              <div className="mt-5 space-y-2">
                {data.lessons.filter((lesson) => lesson.moduleId === module.id).map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-semibold">{lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.duration || "No duration"} {lesson.isPreview ? "· Preview" : ""}</p>
                    </div>
                    <form action={deleteLessonAction}>
                      <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="lessonId" value={lesson.id} />
                      <Button type="submit" size="icon" variant="ghost"><Trash2 /></Button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addLessonAction} className="mt-5 grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 sm:grid-cols-2">
                <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="moduleId" value={module.id} />
                <div className="space-y-2"><Label>Lesson title</Label><Input name="title" required /></div>
                <div className="space-y-2"><Label>Duration</Label><Input name="duration" placeholder="12:30" /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea name="description" /></div>
                <div className="space-y-2"><Label>Video URL</Label><Input name="videoUrl" type="url" /></div>
                <div className="space-y-2"><Label>Resource URL</Label><Input name="resourceUrl" type="url" /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPreview" /> Free preview lesson</label>
                <div className="sm:text-right"><Button type="submit">Add lesson</Button></div>
              </form>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
