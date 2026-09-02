import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "../globals.css";
import { ApplicationProvider } from "@/hooks/useApplication";
import { ScrollReveal } from "@/components/ScrollReveal";
import { I18nProvider } from "@/hooks/useI18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { RouteAnalytics } from "@/components/RouteAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n";
import { SITE_URL } from "@/lib/seo";
import { localePath } from "@/lib/locale";
import { companyJsonLdFields } from "@/config/company";

const display = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

// This is the root layout. Every page lives under `[locale]`, which is what
// lets the server render the right language from the URL alone — the reason the
// old flash of Bulgarian existed was that this layout had no way to know.
//
// Both locales are prerendered, so nothing here costs static generation.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Only `bg` and `en` are real. Anything else 404s rather than rendering an
// empty catalogue.
export const dynamicParams = false;

const OG_LOCALE: Record<Locale, string> = { bg: "bg_BG", en: "en_GB" };

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const messages = getMessages(params.locale);
  const home = localePath(params.locale, "/");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: messages.meta.title,
      // Per-route layouts provide full titles; this template leaves them as-is.
      template: "%s",
    },
    description: messages.meta.description,
    applicationName: "Veyra",
    alternates: {
      canonical: home,
      // x-default alongside the two languages. Every other page declares it
      // (buildMetadata does), so the home page was the one URL on the site that
      // did not tell a crawler which locale to serve an unmatched visitor.
      languages: { bg: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "Veyra",
      locale: OG_LOCALE[params.locale],
      url: `${SITE_URL}${home}`,
      title: messages.meta.title,
      description: messages.meta.description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          // Was hard-coded Bulgarian, so an English share card described its
          // image in Bulgarian.
          alt: messages.meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.meta.title,
      description: messages.meta.description,
      images: ["/og.png"],
    },
    // Search Console / Bing verification, supplied per-environment so no token
    // is committed. Either may be absent.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = params.locale ?? defaultLocale;
  const messages = getMessages(locale);

  // Site-wide structured data: who Veyra is, and site-level search metadata.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Veyra",
    url: SITE_URL,
    logo: `${SITE_URL}/veyra-logo.png`,
    description: messages.meta.description,
    // From the catalogue, not a literal: this was hard-coded Bulgarian, so the
    // Organization entity on every English page carried a Bulgarian slogan
    // beside an English description — mixed-language brand data.
    slogan: messages.meta.slogan,
    // Legal identity, but only the fields actually supplied — a placeholder
    // ЕИК or address must never reach structured data.
    ...companyJsonLdFields(),
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Veyra",
    url: SITE_URL,
    inLanguage: locale,
  };

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <JsonLd data={orgJsonLd} />
        <JsonLd data={siteJsonLd} />
        <I18nProvider locale={locale}>
          <ApplicationProvider>
            <ScrollReveal />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ApplicationProvider>
          <CookieConsent />
        </I18nProvider>
        <Analytics />
        <RouteAnalytics />
      </body>
    </html>
  );
}
