"use client";

import Link from "@/components/LocaleLink";
import { PrimaryCta } from "@/components/PrimaryCta";
import { useMessages } from "@/hooks/useI18n";

/**
 * Call-to-action controls for the Bulgarian-only pages (landing pages, guides).
 *
 * These pages' prose is Bulgarian and stays Bulgarian, but the controls are
 * chrome: they belong to the reader, not to the article. The rule across the
 * site is that anything you *act on* is in your language, while the article
 * text is marked `lang="bg"` and explained by BgOnlyNotice.
 *
 * Before this existed the labels were Bulgarian string literals, which was
 * invisible while these pages were only ever served in Bulgarian. Now that they
 * have `/en` twins, a literal would sit an English button next to a Bulgarian
 * one — and would also resurface the moment pre-launch mode ends, since
 * PrimaryCta only ignores its `label` while pre-launch is on.
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
