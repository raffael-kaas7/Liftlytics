import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Liftlytics",
  description: "Strength training progress tracker for logging sessions and reviewing progress."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get("x-pathname") ?? "/";

  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <AppShell pathname={pathname}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
