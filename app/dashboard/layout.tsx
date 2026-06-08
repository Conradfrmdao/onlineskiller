import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  return (
    <DashboardShell displayName={profile?.displayName || user.name || "Creator"}>
      {children}
    </DashboardShell>
  );
}
