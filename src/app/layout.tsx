import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Liftlytics",
  description: "Strength training progress tracker for logging sessions and reviewing progress.",
  applicationName: "Liftlytics",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "Liftlytics",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316"
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
