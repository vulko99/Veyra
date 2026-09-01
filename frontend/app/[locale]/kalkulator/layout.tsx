import { localizedMetadata, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getMessages } from "@/i18n";
import { defaultLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/locale";

export const generateMetadata = localizedMetadata("/kalkulator");

// Built per request rather than as a module-level constant, which is what it
// used to be: /en/kalkulator emitted a WebApplication entity named in Cyrillic,
// declaring inLanguage "bg", and pointing its own url at the Bulgarian page —
// on a document whose lang, canonical and hreflang all correctly said English.
// A constant cannot vary by locale, so it survived the translation pass.
export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = params.locale ?? defaultLocale;
  const m = getMessages(locale);
  const path = localePath(locale, "/kalkulator");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${m.nav.calculator} — Veyra`,
    url: `${SITE_URL}${path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
