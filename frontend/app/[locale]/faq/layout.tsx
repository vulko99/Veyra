import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getMessages } from "@/i18n";
import { defaultLocale, type Locale } from "@/i18n/config";

export const generateMetadata = localizedMetadata("/faq");

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // The FAQ structured data has to be the questions the page actually shows.
  // Emitting the Bulgarian set on /en/faq would put markup in front of Google
  // that does not match the visible page, which is a rich-result violation.
  const m = getMessages(params.locale ?? defaultLocale);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: m.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <>
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  );
}
