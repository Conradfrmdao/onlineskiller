"use client";

import { useState } from "react";
import { Check, Clipboard, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareLaunchActions({ publicUrl, pageTitle }: { publicUrl: string; pageTitle: string }) {
  const [copied, setCopied] = useState(false);
  const whatsappShareUrl = new URL("https://wa.me/");
  whatsappShareUrl.searchParams.set(
    "text",
    `${pageTitle} is now live. Take a look: ${publicUrl}`,
  );

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={copyLink}>
        {copied ? <Check /> : <Clipboard />}
        {copied ? "Link copied" : "Copy page link"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => window.open(whatsappShareUrl.toString(), "_blank", "noopener,noreferrer")}
      >
        <MessageCircle /> Share to WhatsApp
      </Button>
    </div>
  );
}
