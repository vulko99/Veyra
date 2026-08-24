import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApplicationProvider } from "@/hooks/useApplication";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Veyra — Find financial options that fit you",
  description:
    "Tell us what you need and explore relevant options from our financial partners through one simple application. Veyra is a marketplace and does not lend money itself.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <ApplicationProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ApplicationProvider>
      </body>
    </html>
  );
}
