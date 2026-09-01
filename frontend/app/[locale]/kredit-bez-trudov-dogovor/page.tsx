import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing-content";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/kredit-bez-trudov-dogovor");

export default function Page() {
  return <LandingPage data={getLanding("kredit-bez-trudov-dogovor")!} />;
}
