import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { ApplicationProvider } from "@/hooks/useApplication";
import { I18nProvider } from "@/hooks/useI18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n";

const display = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

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
    <html lang={defaultLocale} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
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
