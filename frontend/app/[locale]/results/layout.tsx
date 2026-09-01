import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { PRELAUNCH } from "@/config/launch";
import { PrelaunchNotice } from "@/components/PrelaunchNotice";

export const metadata: Metadata = NOINDEX;

// The same gate the funnel carries. config/launch.ts states that pre-launch
// "disables only /apply and /results", but only /apply was actually gated, so
// /results stayed reachable in both locales while the funnel was closed.
//
// It could not show anything useful there — a results page needs an
// application, and applications cannot be created while /apply is closed — so
// what it rendered was an empty or error state at a URL the config claims is
// switched off. Worse, it is the one page that displays matched partner
// options, which is exactly the output pre-launch exists to withhold until
// there is a registered entity and a signed partner behind it.
export default function Layout({ children }: { children: React.ReactNode }) {
  if (PRELAUNCH) return <PrelaunchNotice />;
  return children;
}
