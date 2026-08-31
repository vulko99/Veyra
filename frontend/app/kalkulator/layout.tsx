import type { Metadata } from "next";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/kalkulator");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Кредитен калкулатор — Veyra",
  url: `${SITE_URL}/kalkulator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "bg",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
