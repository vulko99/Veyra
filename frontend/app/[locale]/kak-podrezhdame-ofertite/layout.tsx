import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/kak-podrezhdame-ofertite");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
