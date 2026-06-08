import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function OnlineSkillerLogo({
  href = "/",
  compact = false,
  inverse = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <Link href={href} className={cn("inline-flex shrink-0 items-center", className)} aria-label="OnlineSkiller">
        <Image
          src="/brand/onlineskiller-mark.png"
          alt=""
          width={512}
          height={512}
          className="size-10 object-contain"
          priority
        />
      </Link>
    );
  }

  if (inverse) {
    return (
      <Link href={href} className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
        <Image
          src="/brand/onlineskiller-mark.png"
          alt=""
          width={512}
          height={512}
          className="size-10 shrink-0 object-contain"
          priority
        />
        <span className="truncate text-lg font-extrabold tracking-[-0.04em] text-white">
          Online<span className="text-blue-400">Skiller</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("inline-flex min-w-0 items-center", className)} aria-label="OnlineSkiller">
      <Image
        src="/brand/onlineskiller-logo.png"
        alt="OnlineSkiller"
        width={1623}
        height={469}
        className="h-9 w-auto object-contain sm:h-10"
        priority
      />
    </Link>
  );
}
