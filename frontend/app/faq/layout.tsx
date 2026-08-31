import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getMessages } from "@/i18n";
import { defaultLocale } from "@/i18n/config";

export const metadata: Metadata = buildMetadata("/faq");

export default function Layout({ children }: { children: React.ReactNode }) {
  const m = getMessages(defaultLocale);
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
