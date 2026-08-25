"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMatches, selectPartner } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { useI18n } from "@/hooks/useI18n";
import type { Phase2Match } from "@/types";

function ResultsInner() {
  const params = useSearchParams();
  const { m, t } = useI18n();
  const r = m.results;
  const applicationId = params.get("application");
  const [matches, setMatches] = useState<Phase2Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routing, setRouting] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setError(r.noReference);
      return;
    }
    getMatches(applicationId)
      .then((res) => setMatches(res.matches))
      .catch(() => setError(r.loadError));
  }, [applicationId, r.noReference, r.loadError]);

  async function handleContinue(match: Phase2Match) {
    if (!applicationId) return;
    setRouting(match.product_id);
    try {
      const res = await selectPartner(applicationId, match.product_id);
      window.location.href = res.outbound_url;
    } catch {
      setError(r.routeError);
      setRouting(null);
    }
  }

  const productTypeLabel = (pt: string) =>
    (r.productTypes as Record<string, string>)[pt] ?? pt.replace(/_/g, " ");

  return (
    <div className="min-h-[calc(100vh-68px)] bg-canvas">
      <div className="container-x max-w-3xl py-14">
        <div className="reveal">
          <span className="eyebrow">{r.eyebrow}</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
            {r.title}
          </h1>
          <p className="mt-3 text-muted">{r.subhead}</p>
        </div>

        {error && (
          <p className="mt-10 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && matches === null && (
          <div className="mt-10 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
            ))}
          </div>
        )}

        {matches && matches.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-card">
            <h2 className="text-xl font-bold text-ink">{r.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{r.emptyBody}</p>
            <div className="mt-7">
              <Link href="/apply/amount" className="btn-ghost">
                {r.adjust}
              </Link>
            </div>
          </div>
        )}

        {matches && matches.length > 0 && (
          <div className="reveal mt-10 space-y-5">
            {matches.map((match, i) => {
              const top = i === 0;
              return (
                <article
                  key={match.product_id}
                  className={`relative overflow-hidden rounded-2xl bg-white shadow-card transition ${
                    top ? "ring-2 ring-mint/45" : "ring-1 ring-slate-200/70"
                  }`}
                >
                  {top && (
                    <div className="flex items-center gap-1.5 bg-ink px-6 py-2 text-xs font-semibold text-mint">
                      <span aria-hidden>★</span> {r.topMatch}
                    </div>
                  )}
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* text-based partner placeholder (no fabricated logos) */}
                        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-gradient-to-br from-ink to-ink-600 font-display text-lg font-extrabold text-white">
                          {match.partner.charAt(0)}
                        </span>
                        <div>
                          <h2 className="font-display text-lg font-bold text-ink">
                            {match.partner}
                          </h2>
                          <p className="text-sm text-muted">
                            {productTypeLabel(match.product_type)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* key figures — lines, not nested cards */}
                    <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-5">
                      <Figure
                        label={r.amountRange}
                        value={`${formatEUR(match.min_amount_eur)} – ${formatEUR(match.max_amount_eur)}`}
                      />
                      <Figure
                        label={r.termRange}
                        value={`${match.min_term_months}–${match.max_term_months} ${r.months}`}
                      />
                    </div>

                    <p className="mt-5 flex items-center gap-2 text-sm font-medium text-mint-700">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-mint/15 text-xs">
                        ✓
                      </span>
                      {r.suitable}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-xs text-muted">
                        {productTypeLabel(match.product_type)}
                      </span>
                      <button
                        type="button"
                        className={top ? "btn-mint px-5 py-2.5 text-sm" : "btn-primary px-5 py-2.5 text-sm"}
                        disabled={routing === match.product_id}
                        onClick={() => handleContinue(match)}
                      >
                        {routing === match.product_id ? r.opening : r.continueToPartner}
                        <span aria-hidden>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <p className="pt-3 text-center text-xs text-muted">{r.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-display text-base font-bold text-ink tabular-nums">{value}</p>
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
  return <div className="container-x py-14 text-muted">{m.results.loading}</div>;
}
