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

// Absolute base for resolving Open Graph / Twitter image URLs. Set
// NEXT_PUBLIC_SITE_URL to the deployed domain so shared links render the card.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://veyra.bg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: messages.meta.title,
  description: messages.meta.description,
  applicationName: "Veyra",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Veyra",
    locale: "bg_BG",
    url: siteUrl,
    title: messages.meta.title,
    description: messages.meta.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Veyra — една заявка, повече възможности",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: messages.meta.title,
    description: messages.meta.description,
    images: ["/og.png"],
  },
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
