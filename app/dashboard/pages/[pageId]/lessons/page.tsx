import { BookOpen, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import {
  addLessonAction,
  addModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  updateLessonAction,
  updateModuleAction,
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
      <PageHeader
        eyebrow="Course structure"
        title={data.page.title}
        description="Write complete lessons, add videos and resources, and organize them into customer modules."
      />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />

      <form action={addModuleAction} className="panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_1.5fr_auto]">
        <input type="hidden" name="pageId" value={pageId} />
        <Input name="title" placeholder="New module title" required />
        <Input name="description" placeholder="What this module covers" />
        <Button type="submit">Add module</Button>
        <Textarea
          name="content"
          className="min-h-32 sm:col-span-3"
          placeholder="Optional module overview, syllabus, instructions, or resources."
        />
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
              <div className="flex items-start justify-between gap-3">
                <form action={updateModuleAction} className="grid flex-1 gap-3 sm:grid-cols-2">
                  <input type="hidden" name="pageId" value={pageId} />
                  <input type="hidden" name="moduleId" value={module.id} />
                  <div className="sm:col-span-2"><Badge variant="secondary">Module {moduleIndex + 1}</Badge></div>
                  <div className="space-y-2">
                    <Label>Module title</Label>
                    <Input name="title" defaultValue={module.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Module description</Label>
                    <Input name="description" defaultValue={module.description} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Module content</Label>
                    <Textarea
                      name="content"
                      defaultValue={module.content}
                      className="min-h-40"
                      placeholder="Paste or write the module overview, syllabus, instructions, or resources."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" size="sm">Save module</Button>
                  </div>
                </form>
                <form action={deleteModuleAction}>
                  <input type="hidden" name="pageId" value={pageId} />
                  <input type="hidden" name="moduleId" value={module.id} />
                  <Button type="submit" size="icon" variant="destructive" aria-label="Delete module">
                    <Trash2 />
                  </Button>
                </form>
              </div>

              <div className="mt-5 space-y-2">
                {data.lessons.filter((lesson) => lesson.moduleId === module.id).map((lesson) => (
                  <details key={lesson.id} className="rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-semibold">{lesson.title}</p>
                        <p className="text-xs text-slate-500">
                          {lesson.duration || "No duration"} {lesson.isPreview ? "| Free preview" : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-700">Edit lesson</span>
                    </summary>
                    <form action={updateLessonAction} className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2">
                      <input type="hidden" name="pageId" value={pageId} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <div className="space-y-2">
                        <Label>Lesson title</Label>
                        <Input name="title" defaultValue={lesson.title} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input name="duration" defaultValue={lesson.duration} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Short description</Label>
                        <Textarea name="description" defaultValue={lesson.description} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Lesson content</Label>
                        <Textarea
                          name="content"
                          defaultValue={lesson.content}
                          className="min-h-64"
                          placeholder="Paste or write the full lesson, instructions, exercises, links, or notes here."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input name="videoUrl" type="url" defaultValue={lesson.videoUrl || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label>Resource URL</Label>
                        <Input name="resourceUrl" type="url" defaultValue={lesson.resourceUrl || ""} />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isPreview" defaultChecked={lesson.isPreview} />
                        Free preview lesson
                      </label>
                      <div className="text-right"><Button type="submit" size="sm">Save lesson</Button></div>
                    </form>
                    <form action={deleteLessonAction} className="border-t border-slate-200 p-4 text-right">
                      <input type="hidden" name="pageId" value={pageId} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <Button type="submit" size="sm" variant="destructive"><Trash2 /> Delete lesson</Button>
                    </form>
                  </details>
                ))}
              </div>

              <form action={addLessonAction} className="mt-5 grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 sm:grid-cols-2">
                <input type="hidden" name="pageId" value={pageId} />
                <input type="hidden" name="moduleId" value={module.id} />
                <div className="space-y-2"><Label>Lesson title</Label><Input name="title" required /></div>
                <div className="space-y-2"><Label>Duration</Label><Input name="duration" placeholder="12:30" /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Short description</Label><Textarea name="description" /></div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Lesson content</Label>
                  <Textarea
                    name="content"
                    className="min-h-52"
                    placeholder="Paste or write the full lesson, exercises, instructions, or notes."
                  />
                </div>
                <div className="space-y-2"><Label>Video URL</Label><Input name="videoUrl" type="url" /></div>
                <div className="space-y-2"><Label>Resource URL</Label><Input name="resourceUrl" type="url" /></div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPreview" /> Free preview lesson
                </label>
                <div className="sm:text-right"><Button type="submit">Add lesson</Button></div>
              </form>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
