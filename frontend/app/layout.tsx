import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { ApplicationProvider } from "@/hooks/useApplication";
import { I18nProvider } from "@/hooks/useI18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { RouteAnalytics } from "@/components/RouteAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n";
import { SITE_URL } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: messages.meta.title,
    // Per-route layouts provide full titles; this template leaves them as-is.
    template: "%s",
  },
  description: messages.meta.description,
  applicationName: "Veyra",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Veyra",
    locale: "bg_BG",
    url: SITE_URL,
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

// Site-wide structured data: who Veyra is, and site-level search metadata.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Veyra",
  url: SITE_URL,
  logo: `${SITE_URL}/veyra-logo.png`,
  description: messages.meta.description,
  slogan: "Една заявка. Повече възможности.",
};
const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Veyra",
  url: SITE_URL,
  inLanguage: "bg",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={defaultLocale} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <JsonLd data={orgJsonLd} />
        <JsonLd data={siteJsonLd} />
        <I18nProvider initialLocale={defaultLocale}>
          <ApplicationProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ApplicationProvider>
        </I18nProvider>
        <Analytics />
        <RouteAnalytics />
      </body>
    </html>
  );
}
