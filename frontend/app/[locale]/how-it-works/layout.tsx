import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/how-it-works");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
