import { desc, eq } from "drizzle-orm";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { creatorProfiles, payments, users } from "@/db/schema";
import { db } from "@/lib/db";

export default async function AdminPaymentsPage() {
  const rows = await db
    .select({ payment: payments, creator: creatorProfiles, user: users })
    .from(payments)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, payments.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .orderBy(desc(payments.createdAt));
  const completed = rows.filter(({ payment }) => payment.status === "completed");
  const totals = completed.reduce<Record<string, number>>((result, { payment }) => {
    result[payment.currency] = (result[payment.currency] || 0) + payment.amount;
    return result;
  }, {});

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Platform payments"
        description="Review every OnlineSkiller subscription payment, who paid, the provider status, and recorded amount."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-3xl font-black">{rows.length}</p><p className="text-xs uppercase tracking-wide text-slate-500">Payment attempts</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-3xl font-black">{completed.length}</p><p className="text-xs uppercase tracking-wide text-slate-500">Completed</p></CardContent></Card>
        {Object.entries(totals).slice(0, 2).map(([currency, amount]) => (
          <Card key={currency}><CardContent className="p-5"><p className="text-3xl font-black">{currency} {amount.toLocaleString()}</p><p className="text-xs uppercase tracking-wide text-slate-500">Collected</p></CardContent></Card>
        ))}
      </div>
      <div className="panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead>
              <TableHead>Status</TableHead><TableHead>Provider</TableHead><TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ payment, creator, user }) => (
              <TableRow key={payment.id}>
                <TableCell><p className="font-semibold">{creator.businessName}</p><p className="text-xs text-slate-500">{user.email}</p></TableCell>
                <TableCell>{payment.planName}</TableCell>
                <TableCell className="font-semibold">{payment.currency} {payment.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant={payment.status === "completed" ? "success" : payment.status === "failed" ? "destructive" : "warning"}>{payment.status}</Badge></TableCell>
                <TableCell><p>{payment.provider}</p><p className="text-xs text-slate-500">{payment.paymentMethod || payment.requestedPaymentMethod}</p></TableCell>
                <TableCell>{payment.createdAt.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
