import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { PRELAUNCH } from "@/config/launch";
import { PrelaunchNotice } from "@/components/PrelaunchNotice";

export const metadata: Metadata = NOINDEX;

// One gate for the whole funnel: every /apply/* step renders through this
// layout, so pre-launch mode cannot be bypassed by deep-linking to a later
// step. The step components are never mounted, so nothing is collected.
export default function Layout({ children }: { children: React.ReactNode }) {
  if (PRELAUNCH) return <PrelaunchNotice />;
  return children;
}
