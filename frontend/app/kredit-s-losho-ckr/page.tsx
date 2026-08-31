import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/kredit-s-losho-ckr");

export default function Page() {
  return <LandingPage data={getLanding("kredit-s-losho-ckr")!} />;
}
