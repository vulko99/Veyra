"use client";

import Link from "@/components/LocaleLink";
import { PRELAUNCH, PRELAUNCH_CTA_HREF } from "@/config/launch";
import { usePathname } from "next/navigation";
import { useMessages } from "@/hooks/useI18n";
import { splitLocale } from "@/lib/locale";
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
  const pathname = usePathname();
  const href = PRELAUNCH ? PRELAUNCH_CTA_HREF : "/apply";
  const text = PRELAUNCH ? m.prelaunch.cta : label;

  // A call to action pointing at the page you are already on is a dead
  // control. It happens on /kalkulator while the funnel is closed: pre-launch
  // rewrites this button to PRELAUNCH_CTA_HREF, which IS /kalkulator, so the
  // header's most prominent button did nothing — and the nav entry that would
  // have been the working link to that page had already been removed precisely
  // because the button duplicated it.
  //
  // Compared on the locale-stripped path so /en/kalkulator counts as the same
  // page as /kalkulator, and handled here rather than at the call site so a
  // future destination cannot reintroduce it somewhere else.
  const { path } = splitLocale(pathname ?? "/");
  if (path === href) return null;

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
