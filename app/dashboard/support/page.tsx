import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { LifeBuoy, MessageCircle } from "lucide-react";

import {
  createSupportTicketAction,
  replySupportTicketAction,
} from "@/actions/support-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supportMessages, supportTickets } from "@/db/schema";
import { requireUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const query = await searchParams;
  const { user } = await requireUser();
  const tickets = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, user.id))
    .orderBy(desc(supportTickets.updatedAt));
  const selected = tickets.find((ticket) => ticket.id === query.ticket) || tickets[0] || null;
  const messages = selected
    ? await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, selected.id))
        .orderBy(supportMessages.createdAt)
    : [];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Help center"
        title="Support conversations"
        description="Ask about billing, pages, account access, or anything blocking your launch. Replies stay in one conversation."
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-4">
          <form action={createSupportTicketAction} className="panel rounded-2xl p-5">
            <h2 className="font-semibold">Start a new conversation</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category">
                  <option value="general">General help</option>
                  <option value="billing">Billing or subscription</option>
                  <option value="page">Page or publishing</option>
                  <option value="account">Account access</option>
                </Select>
              </div>
              <div className="space-y-2"><Label>Subject</Label><Input name="subject" required /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea name="message" required /></div>
              <Button type="submit" className="w-full"><LifeBuoy /> Send to support</Button>
            </div>
          </form>

          <div className="panel overflow-hidden rounded-2xl">
            <p className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Your tickets</p>
            {tickets.length ? tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support?ticket=${ticket.id}`}
                className={cn(
                  "block border-b border-slate-100 px-4 py-3 last:border-0",
                  selected?.id === ticket.id ? "bg-blue-50" : "hover:bg-slate-50",
                )}
              >
                <p className="truncate text-sm font-semibold">{ticket.subject}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge variant={ticket.status === "resolved" ? "success" : "warning"}>{ticket.status.replaceAll("_", " ")}</Badge>
                  <span className="text-[0.65rem] text-slate-500">{ticket.updatedAt.toLocaleDateString()}</span>
                </div>
              </Link>
            )) : <p className="p-4 text-sm text-slate-500">No support tickets yet.</p>}
          </div>
        </aside>

        <section className="panel min-h-[30rem] rounded-2xl p-5 sm:p-6">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{selected.category}</p>
                  <h2 className="mt-1 text-xl font-bold">{selected.subject}</h2>
                </div>
                <Badge variant={selected.status === "resolved" ? "success" : "warning"}>{selected.status.replaceAll("_", " ")}</Badge>
              </div>
              <div className="mt-5 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[88%] rounded-2xl p-4",
                      message.senderType === "admin"
                        ? "bg-[#071426] text-white"
                        : "ml-auto bg-blue-50 text-blue-950",
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide opacity-65">
                      {message.senderType === "admin" ? "OnlineSkiller support" : "You"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                    <p className="mt-2 text-[0.65rem] opacity-60">{message.createdAt.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <form action={replySupportTicketAction} className="mt-6 border-t border-slate-200 pt-5">
                <input type="hidden" name="ticketId" value={selected.id} />
                <Label>Reply</Label>
                <Textarea name="message" className="mt-2 min-h-28" required />
                <Button type="submit" className="mt-3"><MessageCircle /> Send reply</Button>
              </form>
            </>
          ) : (
            <div className="grid min-h-[26rem] place-items-center text-center">
              <div><LifeBuoy className="mx-auto size-10 text-blue-600" /><p className="mt-3 font-semibold">Start a support conversation.</p></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
