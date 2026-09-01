import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing-content";
import { localizedMetadata } from "@/lib/seo";
import { type Locale } from "@/i18n/config";

export const generateMetadata = localizedMetadata("/kredit-za-avtomobil");

export default function Page({ params }: { params: { locale: Locale } }) {
  return <LandingPage data={getLanding("kredit-za-avtomobil")!} locale={params.locale} />;
}
