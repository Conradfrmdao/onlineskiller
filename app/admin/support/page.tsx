import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { LifeBuoy, MessageCircle } from "lucide-react";

import {
  adminReplySupportTicketAction,
  updateSupportTicketStatusAdminAction,
} from "@/actions/support-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supportMessages, supportTickets, users } from "@/db/schema";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const query = await searchParams;
  const tickets = await db
    .select({ ticket: supportTickets, user: users })
    .from(supportTickets)
    .innerJoin(users, eq(users.id, supportTickets.userId))
    .orderBy(desc(supportTickets.updatedAt));
  const selected = tickets.find(({ ticket }) => ticket.id === query.ticket) || tickets[0] || null;
  const messages = selected
    ? await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, selected.ticket.id))
        .orderBy(supportMessages.createdAt)
    : [];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Administration"
        title="Customer support"
        description="Reply to creator questions, track waiting conversations, and resolve issues with an auditable status."
      />
      <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
        <aside className="panel max-h-[46rem] overflow-y-auto rounded-2xl">
          <p className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            {tickets.length} conversations
          </p>
          {tickets.map(({ ticket, user }) => (
            <Link
              key={ticket.id}
              href={`/admin/support?ticket=${ticket.id}`}
              className={cn(
                "block border-b border-slate-100 px-4 py-4",
                selected?.ticket.id === ticket.id ? "bg-blue-50" : "hover:bg-slate-50",
              )}
            >
              <p className="truncate font-semibold">{ticket.subject}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{user.name} | {user.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant={ticket.status === "resolved" ? "success" : "warning"}>{ticket.status.replaceAll("_", " ")}</Badge>
                <span className="text-[0.65rem] text-slate-500">{ticket.updatedAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </aside>

        <section className="panel rounded-2xl p-5 sm:p-6">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{selected.ticket.category}</p>
                  <h2 className="mt-1 text-xl font-bold">{selected.ticket.subject}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selected.user.name} | {selected.user.email}</p>
                </div>
                <form action={updateSupportTicketStatusAdminAction} className="flex gap-2">
                  <input type="hidden" name="ticketId" value={selected.ticket.id} />
                  <Select name="status" defaultValue={selected.ticket.status}>
                    <option value="open">Open</option>
                    <option value="waiting_on_customer">Waiting on customer</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                  <Button type="submit" size="sm">Update</Button>
                </form>
              </div>
              <div className="mt-5 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[88%] rounded-2xl p-4",
                      message.senderType === "admin"
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900",
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide opacity-65">{message.senderType}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                    <p className="mt-2 text-[0.65rem] opacity-60">{message.createdAt.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <form action={adminReplySupportTicketAction} className="mt-6 border-t border-slate-200 pt-5">
                <input type="hidden" name="ticketId" value={selected.ticket.id} />
                <Textarea name="message" className="min-h-28" placeholder="Reply as OnlineSkiller support" required />
                <Button type="submit" className="mt-3"><MessageCircle /> Send support reply</Button>
              </form>
            </>
          ) : (
            <div className="grid min-h-[30rem] place-items-center text-center">
              <div><LifeBuoy className="mx-auto size-10 text-blue-600" /><p className="mt-3 font-semibold">No support conversations yet.</p></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
