"use client";

import Link from "@/components/LocaleLink";
import { PrimaryCta } from "@/components/PrimaryCta";
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

export function CalculatorLink({ className = "btn-ghost" }: { className?: string }) {
  const m = useMessages();
  return (
    <Link href="/kalkulator" className={className}>
      {m.nav.calculator}
    </Link>
  );
}
