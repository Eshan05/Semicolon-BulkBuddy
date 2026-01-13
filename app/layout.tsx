import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AIAssistant } from "@/components/features/ai-assistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BulkBuddy - Group Buying for SME Businesses",
  description: "Slash raw material costs by 20% through collaborative group buying",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50`}
      >
        <Providers>
          <Toaster />
          <div data-vaul-drawer-wrapper="" className="overflow-x-hidden">
            {children}
          </div>
          <AIAssistant />
        </Providers>
      </body>
    </html>
  );
}
