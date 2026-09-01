import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("/contact");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
