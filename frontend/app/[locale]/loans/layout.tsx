import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/loans");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
