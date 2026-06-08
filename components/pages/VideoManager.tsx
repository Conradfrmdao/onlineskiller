"use client";

import { useActionState } from "react";
import { Play, Trash2 } from "lucide-react";

import { addVideoAction, deleteVideoAction } from "@/actions/page-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PageVideo as Video } from "@/db/schema";
const initialState = { success: false, message: "" };

export function VideoManager({ pageId, videos }: { pageId: string; videos: Video[] }) {
  const [state, action, pending] = useActionState(addVideoAction, initialState);
  return (
    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <form action={action} className="panel h-fit rounded-2xl p-5">
        <input type="hidden" name="pageId" value={pageId} />
        <h2 className="font-semibold">Add embedded video</h2>
        <div className="mt-5 space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea name="description" /></div>
          <div className="space-y-2"><Label>Video URL</Label><Input name="videoUrl" type="url" required placeholder="https://…" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Duration</Label><Input name="duration" placeholder="08:30" /></div>
            <div className="space-y-2"><Label>Sort order</Label><Input name="sortOrder" type="number" min="0" defaultValue={videos.length} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPreview" /> Free preview</label>
        </div>
        {state.message ? <Alert className="mt-4" variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
        <Button type="submit" className="mt-4" disabled={pending}>{pending ? "Adding…" : "Add video"}</Button>
      </form>
      <div className="space-y-3">
        {videos.length === 0 ? (
          <div className="panel rounded-2xl p-10 text-center text-sm text-slate-600">No videos yet. Add an intro, demo, or lesson preview.</div>
        ) : videos.map((video) => (
          <article key={video.id} className="panel flex items-start gap-4 rounded-2xl p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Play /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{video.title}</h3>
                <Badge variant="secondary">{video.videoProvider}</Badge>
                {video.isPreview ? <Badge variant="success">Preview</Badge> : null}
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">{video.videoUrl}</p>
              {video.description ? <p className="mt-2 text-sm text-slate-600">{video.description}</p> : null}
            </div>
            <form action={deleteVideoAction}>
              <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="videoId" value={video.id} />
              <Button type="submit" variant="destructive" size="icon" aria-label="Delete video"><Trash2 /></Button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
