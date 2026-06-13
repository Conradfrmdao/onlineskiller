import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { MobileDashboardNav } from "@/components/layout/MobileDashboardNav";

export function DashboardShell({
  children,
  displayName,
  pageSlug,
  isAdmin = false,
}: {
  children: React.ReactNode;
  displayName: string;
  pageSlug?: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="dashboard-bg min-h-screen lg:pl-72">
      <DashboardSidebar isAdmin={isAdmin} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <DashboardTopbar displayName={displayName} pageSlug={pageSlug} isAdmin={isAdmin} />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
      <MobileDashboardNav />
    </div>
  );
}
