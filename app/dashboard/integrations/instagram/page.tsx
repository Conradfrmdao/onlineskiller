import { CalendarClock, Camera, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";

export default async function InstagramIntegrationPage() {
  await requireCreator();
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader eyebrow="Integration preview" title="Instagram scheduling is coming later" description="OnlineSkiller will only use official Meta APIs. Username-and-password automation will never be requested." />
      <div className="panel rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white"><Camera /></span>
          <Badge variant="warning">Disabled in MVP</Badge>
        </div>
        <h2 className="mt-10 text-2xl font-semibold">What the future connection will support</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {["Connect a professional account", "Choose a licensed marketing asset", "Write or reuse a caption", "Choose date and time", "Review scheduled posts", "See success or failure status"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><CalendarClock className="size-4 text-blue-600" />{item}</div>
          ))}
        </div>
        <Button disabled className="mt-6">Connect Instagram</Button>
      </div>
      <Alert>
        <div className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-blue-600" /><p>A future connection will use Meta OAuth and platform permissions. OnlineSkiller will not store your Instagram password.</p></div>
      </Alert>
    </div>
  );
}
