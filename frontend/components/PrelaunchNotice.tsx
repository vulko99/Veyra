"use client";

import Link from "next/link";
import { useMessages } from "@/hooks/useI18n";

/**
 * Shown in place of the application funnel while pre-launch mode is on.
 *
 * Deliberately collects nothing — no "notify me" email field. Capturing an
 * address here would be exactly the data collection pre-launch mode exists to
 * prevent, and Bulgarian law (ЗЕС чл. 261) requires prior opt-in for consumer
 * electronic marketing anyway.
 *
 * It also says plainly that no data is being collected, rather than presenting
 * a vague "coming soon" — someone who arrived intending to apply deserves to
 * know why they cannot, and what they can use instead.
 */
export function PrelaunchNotice() {
  const m = useMessages().prelaunch;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      <div className="container-x max-w-2xl py-20 sm:py-28">
        <div className="reveal">
          <span className="eyebrow">{m.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{m.title}</h1>
          <p className="mt-5 t-body text-muted">{m.body}</p>
          <p className="mt-3 t-body text-muted">{m.noData}</p>

          <div className="mt-10 border-t border-slate-200/80 pt-7">
            <h2 className="t-h3 text-ink">{m.meanwhileTitle}</h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/kalkulator" className="btn-mint">
                {m.calculatorCta}
                <span aria-hidden>→</span>
              </Link>
              <Link href="/guides" className="btn-ghost">
                {m.guidesCta}
              </Link>
            </div>
          </div>

          <p className="mt-10 t-small text-muted/80">{m.notALender}</p>
        </div>
      </div>
    </div>
  );
}
