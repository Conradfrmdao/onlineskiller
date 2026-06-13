import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAdminUserId } from "@/lib/auth/admin";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [{ user, profile }, adminUserId] = await Promise.all([requireUser(), getAdminUserId()]);
  return (
    <DashboardShell
      displayName={profile?.displayName || user.name || "Creator"}
      isAdmin={Boolean(adminUserId)}
    >
      {children}
    </DashboardShell>
  );
}
