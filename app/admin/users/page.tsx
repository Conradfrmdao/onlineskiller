import { asc } from "drizzle-orm";

import { users } from "@/db/schema";
import { updateUserAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const rows = await db.select().from(users).orderBy(asc(users.createdAt));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Users" description="Manage platform roles and account availability." />
      <div className="panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell><p className="font-semibold">{user.name || "Unnamed"}</p><p className="text-xs text-slate-500">{user.email}</p></TableCell>
                <TableCell><Badge variant={user.role === "admin" ? "warning" : "secondary"}>{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge></TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <form action={updateUserAdminAction} className="flex min-w-72 gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <Select name="role" defaultValue={user.role}><option value="creator">creator</option><option value="admin">admin</option></Select>
                    <Select name="status" defaultValue={user.status}><option value="active">active</option><option value="suspended">suspended</option></Select>
                    <Button type="submit" size="sm">Save</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
