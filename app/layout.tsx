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
    default: "get_job",
    template: "%s · get_job",
  },
  description: "Remote-first job discovery. Free to browse, no signup needed.",
  icons: {
    icon: "/gj-logo.png",
  },
};

const themeBootstrap = `(function(){try{var t=localStorage.getItem('get_job-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

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
