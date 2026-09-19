import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import TopNav from "@/components/TopNav";
import Toaster from "@/components/Toaster";
import AlertBanner from "@/components/AlertBanner";

export const metadata: Metadata = {
  title: "CareEcho — Health Companion",
  description:
    "A real-time multimodal health companion for seniors and their caregivers: voice check-ins, prescription scanning, and medication adherence.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBFBFA",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans text-ink">
        <AppProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <TopNav />
          <AlertBanner />
          <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-6">
            {children}
          </main>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
