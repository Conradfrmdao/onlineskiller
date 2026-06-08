import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <p className="text-sm font-bold text-blue-600">404</p>
        <h1 className="mt-3 text-3xl font-bold">That page is not here.</h1>
        <p className="mt-3 text-sm text-slate-600">The link may be old, private, or mistyped.</p>
        <Button asChild className="mt-5"><Link href="/">Return home</Link></Button>
      </div>
    </main>
  );
}
