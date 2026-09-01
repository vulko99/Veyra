"use client";

import Link from "next/link";
import { useMessages } from "@/hooks/useI18n";

/**
 * Ranking-methodology disclosure — ЗЗП чл. 47а.
 *
 * Bulgarian consumer protection law requires disclosure of the main parameters
 * determining how results are ranked. Veyra's core function is a ranked results
 * page, so this is a first-order obligation.
 *
 * The content is NOT marketing copy. It describes what the matching engine
 * actually does (backend/apps/matching/scoring.py and phase2.py), including the
 * part that is commercially motivated: the operator-set `priority` tie-break.
 * Stating that plainly is the point of the page — do not soften it.
 *
 * Follows the active locale — the site has a Bulgarian/English switcher, and a
 * ranking disclosure the reader cannot read is not a disclosure.
 */
export default function RankingPage() {
  const all = useMessages();
  const m = all.ranking;

  return (
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-60 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      <div className="container-x max-w-3xl py-16 sm:py-20">
        <header className="reveal">
          <span className="eyebrow">{m.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{m.title}</h1>
          <p className="mt-5 t-body text-muted">{m.intro}</p>
        </header>

        {/* The scoring factors and their weights. */}
        <section className="mt-14 border-t border-slate-200/80 pt-7">
          <h2 className="t-h3 text-ink">{m.paramsTitle}</h2>
          <p className="mt-2 t-body text-muted">{m.paramsIntro}</p>
          <dl className="mt-6 space-y-5">
            {m.params.map((p) => (
              <div key={p.label}>
                <dt className="font-display text-base font-bold text-ink">
                  {p.label}
                </dt>
                <dd className="mt-1 t-body text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-t border-slate-200/80 pt-7">
          <h2 className="t-h3 text-ink">{m.orderTitle}</h2>
          <p className="mt-2 t-body text-muted">{m.orderBody}</p>
        </section>

        {/* The commercial disclosure. Highlighted deliberately: this is the
            part a reader is entitled to find without hunting for it. */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
          <h2 className="t-h3 text-ink">{m.commercialTitle}</h2>
          <p className="mt-2 t-body text-ink">{m.commercialBody}</p>
        </section>

        <section className="mt-10 border-t border-slate-200/80 pt-7">
          <h2 className="t-h3 text-ink">{m.moneyTitle}</h2>
          <p className="mt-2 t-body text-muted">{m.moneyBody}</p>
        </section>

        <section className="mt-10 border-t border-slate-200/80 pt-7">
          <h2 className="t-h3 text-ink">{m.notLenderTitle}</h2>
          <p className="mt-2 t-body text-muted">{m.notLenderBody}</p>
        </section>

        <section className="mt-10 border-t border-slate-200/80 pt-7">
          <h2 className="t-h3 text-ink">{m.notUsedTitle}</h2>
          <ul className="mt-3 space-y-2">
            {m.notUsed.map((item) => (
              <li key={item} className="flex gap-2.5 t-body text-muted">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-mint" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 t-small text-muted/80">{m.footnote}</p>

        <nav className="mt-10 flex flex-wrap gap-2.5">
          <Link
            href="/how-it-works"
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-mint/50 hover:text-mint-600"
          >
            {all.nav.howItWorks}
          </Link>
          <Link
            href="/partners"
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-mint/50 hover:text-mint-600"
          >
            {all.footer.links.partners}
          </Link>
        </nav>
      </div>
    </div>
  );
}
