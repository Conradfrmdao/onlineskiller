import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "OnlineSkiller",
  title: {
    default: "Online Skiller - Make Money Online",
    template: "%s | OnlineSkiller",
  },
  description:
    "Turn your digital product, business, or skill into an online offer with a professional website, marketing tools, and a clear sales roadmap.",
  openGraph: {
    title: "Online Skiller - Make Money Online",
    description: "Build your offer, launch your website, and follow a practical roadmap toward your first online sales.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Online Skiller - Make Money Online",
    description: "Build your offer, launch your website, and follow a practical roadmap toward your first online sales.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
