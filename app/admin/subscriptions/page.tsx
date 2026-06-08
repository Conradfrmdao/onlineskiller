import { asc, eq } from "drizzle-orm";

import { creatorProfiles, subscriptions, users } from "@/db/schema";
import { updateSubscriptionAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";

export default async function AdminSubscriptionsPage() {
  const rows = await db
    .select({ creator: creatorProfiles, user: users, subscription: subscriptions })
    .from(creatorProfiles)
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .leftJoin(subscriptions, eq(subscriptions.creatorId, creatorProfiles.id))
    .orderBy(asc(creatorProfiles.businessName));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Subscriptions" description="Grant trials, activate plans, extend access, or deactivate a creator manually." />
      <div className="panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader><TableRow><TableHead>Creator</TableHead><TableHead>Current</TableHead><TableHead>Period end</TableHead><TableHead>Manual update</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map(({ creator, user, subscription }) => (
            <TableRow key={creator.id}>
              <TableCell><p className="font-semibold">{creator.businessName}</p><p className="text-xs text-slate-500">{user.email}</p></TableCell>
              <TableCell><div className="flex gap-2"><Badge variant="secondary">{subscription?.planName || "starter"}</Badge><Badge variant={subscription?.status === "active" || subscription?.status === "trialing" ? "success" : "warning"}>{subscription?.status || "inactive"}</Badge></div></TableCell>
              <TableCell>{subscription?.currentPeriodEnd?.toLocaleDateString() || "—"}</TableCell>
              <TableCell>
                <form action={updateSubscriptionAdminAction} className="grid min-w-[34rem] grid-cols-[1fr_1fr_90px_auto] gap-2">
                  <input type="hidden" name="creatorId" value={creator.id} />
                  <Select name="planName" defaultValue={subscription?.planName || "starter"}><option value="starter">Starter</option><option value="growth">Growth</option><option value="pro">Pro</option></Select>
                  <Select name="status" defaultValue={subscription?.status || "active"}><option value="active">active</option><option value="trialing">trialing</option><option value="inactive">inactive</option><option value="expired">expired</option></Select>
                  <Input name="months" type="number" min="1" max="24" defaultValue="1" aria-label="Months" />
                  <Button type="submit" size="sm">Apply</Button>
                </form>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
