import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing-content";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/kredit-za-avtomobil");

export default function Page() {
  return <LandingPage data={getLanding("kredit-za-avtomobil")!} />;
}
