"use client";

import Link from "@/components/LocaleLink";
import { PrimaryCta } from "@/components/PrimaryCta";
import { PRELAUNCH, PRELAUNCH_SECONDARY_HREF } from "@/config/launch";
import { useMessages } from "@/hooks/useI18n";

/**
 * Call-to-action controls for the landing pages and the guides.
 *
 * Before this existed the labels were Bulgarian string literals, which was
 * invisible while these pages were only ever served in Bulgarian. Now that each
 * of them has a real English twin, a literal would sit a Bulgarian button under
 * English prose — and would also resurface the moment pre-launch mode ends,
 * since PrimaryCta only ignores its `label` while pre-launch is on.
 */
export function StartCta({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  const m = useMessages();
  return (
    <PrimaryCta
      label={m.common.startCta}
      location={location}
      className={className}
    />
  );
}

/**
 * The companion to StartCta: the second, quieter next step beside it.
 *
 * It has to move when PrimaryCta moves. Once the funnel is open the primary
 * goes to /apply and the calculator is the natural alternative, but pre-launch
 * rewrites the primary *to* the calculator — so a fixed calculator link put two
 * buttons to the same page side by side on all ten landing pages. Mirroring the
 * gate here keeps the pair offering two genuinely different next steps in both
 * states, without a second component deciding where /apply lives.
 */
export function SecondaryCta({ className = "btn-ghost" }: { className?: string }) {
  const m = useMessages();
  const href = PRELAUNCH ? PRELAUNCH_SECONDARY_HREF : "/kalkulator";
  const text = PRELAUNCH ? m.prelaunch.guidesCta : m.nav.calculator;

  return (
    <Link href={href} className={className}>
      {text}
    </Link>
  );
}
