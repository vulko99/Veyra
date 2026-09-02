"use client";

import { CreditCalculator } from "@/components/CreditCalculator";
import { CreditWarning } from "@/components/CreditWarning";
import { useMessages } from "@/hooks/useI18n";

export default function CalculatorPage() {
  const { calculator: c } = useMessages();
  return (
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div className="container-x max-w-4xl py-16 sm:py-20">
        <div className="reveal max-w-2xl">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{c.title}</h1>
          <p className="mt-5 t-body text-muted">{c.intro}</p>
        </div>

        {/* Reveals like everything else. It was left static on the argument
            that regulated copy should be readable the instant the page is —
            but the home page has always revealed the same component, so the
            two pages contradicted each other and this one looked unfinished.

            Nothing is at risk: ScrollReveal only hides a block after script has
            run AND found it below the fold, unarms anything the observer misses,
            and never ships a hidden state in the server HTML. This warning also
            sits high on the page, so on most screens it is never armed at all. */}
        <CreditWarning className="reveal-scroll mt-8" />

        <div className="reveal-scroll mt-8">
          <CreditCalculator />
        </div>

        <section className="reveal-scroll mt-14 max-w-2xl border-t border-slate-200/80 pt-8">
          <h2 className="t-h3 text-ink">{c.seoHeading}</h2>
          <p className="mt-2 t-body text-muted">{c.seoBody}</p>
        </section>
      </div>
    </div>
  );
}
