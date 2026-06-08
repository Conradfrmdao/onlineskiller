import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center"><OnlineSkillerLogo className="justify-center" /><div className="mx-auto mt-6 h-1.5 w-44 animate-pulse rounded-full bg-blue-600/30" /><p className="mt-3 text-sm text-slate-500">Loading OnlineSkiller…</p></div>
    </main>
  );
}
