"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMatches, selectPartner } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useI18n } from "@/hooks/useI18n";
import { AppShell } from "@/components/WizardStep";
import type { Phase2Match } from "@/types";

/** Compact dark matching motif: request → engine → matches, animated routes. */
function ResultsViz({ count }: { count: number }) {
  const { m } = useI18n();
  const v = m.home.viz;
  const outs = Array.from({ length: Math.min(count || 3, 3) });
  return (
    <div className="relative overflow-hidden rounded-2xl border border-appborder bg-appsurface/60 p-5 sm:p-6">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="text-[0.62rem] uppercase tracking-[0.14em] text-appmuted">
            {v.request}
          </p>
          <p className="mt-0.5 font-display text-sm font-bold text-appwhite">
            {v.requestValue}
          </p>
        </div>

        <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#21C7A8" />
            </linearGradient>
          </defs>
          <path d="M0 20 H200" stroke="#26364B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path
            d="M0 20 H200"
            stroke="url(#rg)"
            strokeWidth="2"
            strokeDasharray="5 10"
            vectorEffect="non-scaling-stroke"
            className="animate-dash-flow"
          />
        </svg>

        <div className="flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-mint/40 bg-appselect">
            <span className="h-2.5 w-2.5 rounded-full bg-mint animate-pulse-node" />
          </span>
          <div className="hidden flex-col gap-1 sm:flex">
            {outs.map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full bg-mint/60 animate-pulse-node"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsInner() {
  const params = useSearchParams();
  const { m } = useI18n();
  const r = m.results;
  const applicationId = params.get("application");
  const [matches, setMatches] = useState<Phase2Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routing, setRouting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Phase2Match | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setError(r.noReference);
      return;
    }
    getMatches(applicationId)
      .then((res) => {
        setMatches(res.matches);
        // Funnel signals only — a count, never applicant data.
        const count = res.matches.length;
        track("matches_shown", { count });
        if (count >= 1) track("match_generated", { count });
        if (count > 1) track("multiple_matches_generated", { count });
      })
      .catch(() => setError(r.loadError));
  }, [applicationId, r.noReference, r.loadError]);

  async function handleContinue(match: Phase2Match) {
    if (!applicationId) return;
    setRouting(match.product_id);
    track("partner_selected", { partner_slug: match.partner_slug, rank: match.ranking });
    try {
      const res = await selectPartner(applicationId, match.product_id);
      track("partner_clicked", { partner_slug: match.partner_slug });
      track("outbound_click", { partner_slug: match.partner_slug });
      window.location.href = res.outbound_url;
    } catch {
      setError(r.routeError);
      setRouting(null);
    }
  }

  const productTypeLabel = (pt: string) =>
    (r.productTypes as Record<string, string>)[pt] ?? pt.replace(/_/g, " ");

  return (
    <AppShell current="results">
      <div className="mx-auto w-full max-w-2xl pt-8 sm:pt-12">
        <div className="reveal">
          <span className="a-eyebrow">{r.eyebrow}</span>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.06] tracking-tight text-appwhite sm:text-[2.6rem]">
            {matches && matches.length > 1 ? r.titleMultiple : r.title}
          </h1>
          <p className="mt-3 text-appmuted">{r.subhead}</p>

          {matches && matches.length > 0 && (
            <>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 text-sm font-semibold text-mint-400">
                <span className="font-display text-base font-extrabold text-appwhite">
                  {matches.length}
                </span>
                {r.countSuffix}
              </div>
              <div className="mt-6">
                <ResultsViz count={matches.length} />
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {!error && matches === null && (
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-appborder bg-appsurface/60" />
            ))}
          </div>
        )}

        {matches && matches.length === 0 && (
          <div className="mt-8 rounded-2xl border border-appborder bg-appsurface p-10 text-center">
            <h2 className="text-xl font-bold text-appwhite">{r.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-appmuted">{r.emptyBody}</p>
            <div className="mt-7">
              <Link href="/apply/amount" className="a-btn-ghost">
                {r.adjust}
              </Link>
            </div>
          </div>
        )}

        {matches && matches.length > 0 && (
          <div className="reveal mt-6 space-y-4">
            {matches.map((match, i) => {
              const top = i === 0;
              return (
                <article
                  key={match.product_id}
                  className={`overflow-hidden rounded-2xl border bg-appsurface ${
                    top ? "border-mint/50 shadow-[0_0_0_1px_rgba(33,199,168,0.25),0_24px_60px_-30px_rgba(33,199,168,0.5)]" : "border-appborder"
                  }`}
                >
                  {top && (
                    <div className="flex items-center gap-1.5 border-b border-mint/20 bg-mint/10 px-6 py-2 text-xs font-semibold text-mint-400">
                      <span aria-hidden>★</span> {r.topMatch}
                    </div>
                  )}
                  <div className="p-6 sm:p-7">
                    <div className="flex items-center gap-4">
                      {/* text-based partner placeholder (no fabricated logos) */}
                      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-white/10 bg-white/5 font-display text-lg font-extrabold text-appwhite">
                        {match.partner.charAt(0)}
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-appwhite">
                          {match.partner}
                        </h2>
                        <p className="text-sm text-appmuted">
                          {productTypeLabel(match.product_type)}
                        </p>
                      </div>
                      {typeof match.compatibility_score === "number" &&
                        match.compatibility_score > 0 && (
                          <span
                            className="ml-auto flex-none rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-right text-xs font-semibold text-mint-400"
                            title={r.compatibilityLabel}
                          >
                            {r.compatibilityLabel}
                            <span className="ml-1 font-display text-sm font-extrabold text-appwhite">
                              {match.compatibility_score}
                              <span className="text-appmuted">/100</span>
                            </span>
                          </span>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5">
                      <Figure
                        label={r.amountRange}
                        value={`${formatEUR(match.min_amount_eur)} — ${formatEUR(match.max_amount_eur)}`}
                      />
                      <Figure
                        label={r.termRange}
                        value={`${match.min_term_months} — ${match.max_term_months} ${r.months}`}
                      />
                    </div>

                    <p className="mt-5 flex items-center gap-2 text-sm font-medium text-mint-400">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-mint/15 text-xs">
                        ✓
                      </span>
                      {r.suitable}
                    </p>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="btn-mint w-full sm:w-auto"
                        disabled={routing === match.product_id}
                        onClick={() => setConfirming(match)}
                      >
                        {routing === match.product_id ? r.opening : r.continueToPartner}
                        <span aria-hidden>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <p className="pt-1 text-xs leading-relaxed text-appmuted/90">
              {r.compatibilityExplainer}
            </p>
            <p className="pt-2 text-center text-xs text-appmuted">{r.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Partner-selection confirmation — the referral is created only after
          the user explicitly confirms (and understands they leave Veyra). */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-midnight/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => routing === null && setConfirming(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-appborder bg-appsurface p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-bold text-appwhite">
              {r.confirmTitlePrefix}
              {confirming.partner}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-appmuted">{r.confirmBody}</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                className="a-btn-ghost w-full sm:w-auto"
                disabled={routing !== null}
                onClick={() => setConfirming(null)}
              >
                {r.back}
              </button>
              <button
                type="button"
                className="btn-mint w-full flex-1 justify-center"
                disabled={routing !== null}
                onClick={() => handleContinue(confirming)}
              >
                {routing !== null ? r.opening : `${r.confirmCtaPrefix}${confirming.partner}`}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-appmuted">{label}</p>
      <p className="mt-1 font-display text-base font-bold text-appwhite tabular-nums">{value}</p>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsInner />
    </Suspense>
  );
}

function ResultsFallback() {
  const { m } = useI18n();
  return (
    <AppShell current="results">
      <div className="pt-12 text-appmuted">{m.results.loading}</div>
    </AppShell>
  );
}
