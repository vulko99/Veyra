import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApplicationProvider } from "@/hooks/useApplication";
import { I18nProvider } from "@/hooks/useI18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

const messages = getMessages(defaultLocale);

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={defaultLocale} className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider initialLocale={defaultLocale}>
          <ApplicationProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ApplicationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
