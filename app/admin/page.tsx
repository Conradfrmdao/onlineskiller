import Link from "next/link";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import {
  CreditCard,
  Files,
  LifeBuoy,
  MessageSquareText,
  ReceiptText,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  creatorProfiles,
  customerRequests,
  pages,
  payments,
  subscriptions,
  supportTickets,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";

export default async function AdminHomePage() {
  const [
    userRows,
    livePageRows,
    subscriptionRows,
    paymentRows,
    requestRows,
    supportRows,
    recentPayments,
    recentTickets,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db
      .select({ total: count() })
      .from(pages)
      .where(and(eq(pages.isLive, true), eq(pages.moderationStatus, "active"))),
    db
      .select({ total: count() })
      .from(subscriptions)
      .where(inArray(subscriptions.status, ["active", "trialing"])),
    db.select({ total: count() }).from(payments).where(eq(payments.status, "completed")),
    db.select({ total: count() }).from(customerRequests),
    db
      .select({ total: count() })
      .from(supportTickets)
      .where(inArray(supportTickets.status, ["open", "waiting_on_customer"])),
    db
      .select({ payment: payments, creator: creatorProfiles, user: users })
      .from(payments)
      .innerJoin(creatorProfiles, eq(creatorProfiles.id, payments.creatorId))
      .innerJoin(users, eq(users.id, creatorProfiles.userId))
      .orderBy(desc(payments.createdAt))
      .limit(5),
    db
      .select({ ticket: supportTickets, user: users })
      .from(supportTickets)
      .innerJoin(users, eq(users.id, supportTickets.userId))
      .orderBy(desc(supportTickets.updatedAt))
      .limit(5),
  ]);

  const metrics = [
    ["Users", userRows[0]?.total || 0, "/admin/users", Users],
    ["Live pages", livePageRows[0]?.total || 0, "/admin/pages", Files],
    ["Active subscriptions", subscriptionRows[0]?.total || 0, "/admin/subscriptions", CreditCard],
    ["Completed payments", paymentRows[0]?.total || 0, "/admin/payments", ReceiptText],
    ["Customer requests", requestRows[0]?.total || 0, "/admin/pages", MessageSquareText],
    ["Open support", supportRows[0]?.total || 0, "/admin/support", LifeBuoy],
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Platform overview"
        description="Monitor creators, live offers, subscriptions, payments, customer demand, and support from one console."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics.map(([label, value, href, Icon]) => (
          <Link key={label} href={href}>
            <Card className="h-full transition hover:-translate-y-1 hover:border-blue-200">
              <CardContent className="p-5">
                <Icon className="size-5 text-blue-600" />
                <p className="mt-7 text-3xl font-black">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Recent subscription payments</h2>
            <Link href="/admin/payments" className="text-sm font-semibold text-blue-700">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-200">
            {recentPayments.length ? recentPayments.map(({ payment, creator, user }) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{creator.businessName}</p>
                  <p className="truncate text-xs text-slate-500">{user.email} | {payment.planName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{payment.currency} {payment.amount.toLocaleString()}</p>
                  <Badge variant={payment.status === "completed" ? "success" : payment.status === "failed" ? "destructive" : "warning"}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            )) : <p className="py-8 text-center text-sm text-slate-500">No payments recorded yet.</p>}
          </div>
        </section>

        <section className="panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Latest support conversations</h2>
            <Link href="/admin/support" className="text-sm font-semibold text-blue-700">Open inbox</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-200">
            {recentTickets.length ? recentTickets.map(({ ticket, user }) => (
              <Link
                key={ticket.id}
                href={`/admin/support?ticket=${ticket.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:text-blue-700"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{ticket.subject}</p>
                  <p className="truncate text-xs text-slate-500">{user.name || user.email} | {ticket.category}</p>
                </div>
                <Badge variant={ticket.status === "resolved" ? "success" : "warning"}>
                  {ticket.status.replaceAll("_", " ")}
                </Badge>
              </Link>
            )) : <p className="py-8 text-center text-sm text-slate-500">No support conversations yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
