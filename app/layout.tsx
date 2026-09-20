import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ToastProvider } from "@/components/toast/toast-provider";
import { getBackendUrl } from "@/lib/api";
import { hasServerSession } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Get Job — Remote Job Discovery",
    template: "%s · Get Job",
  },
  description: "Discover remote-first jobs. Free to browse, no signup required. Filter by role, company, or keyword.",
  keywords: ["remote jobs", "work from home", "job board", "tech jobs", "remote work", "career"],
  authors: [{ name: "okorojames", url: "https://okorojames.com" }],
  creator: "okorojames",
  publisher: "okorojames",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://get-job.okorojames.com",
    siteName: "Get Job",
    title: "Get Job — Remote Job Discovery",
    description: "Discover remote-first jobs. Free to browse, no signup required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Get Job - Remote Job Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Job — Remote Job Discovery",
    description: "Discover remote-first jobs. Free to browse, no signup required.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/gj-logo.png",
    shortcut: "/gj-logo.png",
    apple: "/gj-logo.png",
  },
  manifest: "/site.webmanifest",
};

const themeBootstrap = `(function(){try{var t=localStorage.getItem('get-job-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initiallyAuthed = await hasServerSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>
          <AuthProvider backendUrl={getBackendUrl()}>
            <SiteHeader initiallyAuthed={initiallyAuthed} />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
