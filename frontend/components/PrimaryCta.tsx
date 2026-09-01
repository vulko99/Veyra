"use client";

import Link from "next/link";
import { PRELAUNCH, PRELAUNCH_CTA_HREF } from "@/config/launch";
import { useMessages } from "@/hooks/useI18n";
import { track } from "@/lib/analytics";

/**
 * The site's primary call-to-action.
 *
 * Every route into the application funnel goes through this component, so
 * pre-launch mode cannot be half-applied: there is one place that decides
 * whether a CTA points at /apply or at the calculator. Do not hand-roll
 * `<Link href="/apply">` elsewhere.
 */
export function PrimaryCta({
  label,
  className = "btn-mint",
  location,
  arrow = true,
  onNavigate,
}: {
  /** Label used when the funnel is open. Ignored in pre-launch mode. */
  label: string;
  className?: string;
  /** Analytics label for where the click came from. */
  location?: string;
  arrow?: boolean;
  onNavigate?: () => void;
}) {
  const m = useMessages();
  const href = PRELAUNCH ? PRELAUNCH_CTA_HREF : "/apply";
  const text = PRELAUNCH ? m.prelaunch.cta : label;

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (location) {
          track("cta_click", { location, prelaunch: PRELAUNCH });
        }
        onNavigate?.();
      }}
    >
      {text}
      {arrow && <span aria-hidden>→</span>}
    </Link>
  );
}
