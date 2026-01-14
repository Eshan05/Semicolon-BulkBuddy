import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BulkBuddy - Group Buying Platform for SMEs",
  description: "Connect with local SMEs to buy raw materials in bulk and get discounted prices. Join pools, negotiate with suppliers, and save on your business supplies.",
  keywords: ["bulk buying", "raw materials", "SMEs", "group purchasing", "business supplies", "discounts", "manufacturing"],
  authors: [{ name: "BulkBuddy Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "BulkBuddy - Group Buying Platform for SMEs",
    description: "Connect with local SMEs to buy raw materials in bulk and get discounted prices. Join pools, negotiate with suppliers, and save on your business supplies.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BulkBuddy - Group Buying Platform for SMEs",
    description: "Connect with local SMEs to buy raw materials in bulk and get discounted prices. Join pools, negotiate with suppliers, and save on your business supplies.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Toaster />
        <div data-vaul-drawer-wrapper="" className="overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
