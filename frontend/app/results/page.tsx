"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMatches, routeToPartner } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/hooks/useI18n";
import type { Match } from "@/types";

function ResultsInner() {
  const params = useSearchParams();
  const { m, t } = useI18n();
  const r = m.results;
  const applicationId = params.get("application");
  const [matches, setMatches] = useState<Match[] | null>(null);
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

  async function handleContinue(match: Match) {
    if (!applicationId) return;
    setRouting(match.product_id);
    try {
      const res = await routeToPartner(applicationId, match.product_id);
      window.location.href = res.outbound_url;
    } catch {
      setError(r.routeError);
      setRouting(null);
    }
  }

  function productTypeLabel(productType: string): string {
    return (
      (r.productTypes as Record<string, string>)[productType] ??
      productType.replace(/_/g, " ")
    );
  }

  function reasonText(reason: Match["reasons"][number]): string {
    const template = (r.reasons as Record<string, string>)[reason.code];
    if (template) return t(template, reason.params);
    return reason.text; // fallback to the backend-provided text
  }

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-accent-600">{r.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">
          {r.title}
        </h1>
        <p className="mt-3 text-slate-600">{r.intro}</p>

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && matches === null && (
          <div className="mt-10 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-40 animate-pulse bg-slate-100" />
            ))}
          </div>
        )}

        {matches && matches.length === 0 && (
          <div className="mt-10 card p-8 text-center">
            <h2 className="text-lg font-semibold text-navy-900">
              {r.emptyTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{r.emptyBody}</p>
            <div className="mt-6">
              <Link href="/apply/amount" className="btn-ghost">
                {r.adjust}
              </Link>
            </div>
          </div>
        )}

        {matches && matches.length > 0 && (
          <div className="mt-10 space-y-5">
            {matches.map((match) => (
              <div key={match.product_id} className="card p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-navy-700">
                      {match.lender_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-navy-900">
                        {match.lender_name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {match.product_name}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-600">
                    {r.appearsRelevant}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Fact
                    label={r.amountRange}
                    value={`${formatCurrency(match.min_amount, match.currency)} – ${formatCurrency(
                      match.max_amount,
                      match.currency
                    )}`}
                  />
                  <Fact
                    label={r.termRange}
                    value={`${match.min_term_months}–${match.max_term_months} ${r.months}`}
                  />
                  <Fact label={r.type} value={productTypeLabel(match.product_type)} />
                </div>

                {match.reasons.length > 0 && (
                  <ul className="mt-5 space-y-1.5">
                    {match.reasons.map((reason, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-0.5 text-accent-500">✓</span>
                        {reasonText(reason)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {t(r.finalDecisionBy, { lender: match.lender_name })}
                  </p>
                  <button
                    type="button"
                    className="btn-accent px-5 py-2.5 text-sm"
                    disabled={routing === match.product_id}
                    onClick={() => handleContinue(match)}
                  >
                    {routing === match.product_id ? r.opening : r.continueToPartner}
                  </button>
                </div>
              </div>
            ))}

            <p className="pt-2 text-center text-xs text-slate-500">
              {r.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy-900">{value}</p>
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
  return <div className="container-x py-14">{m.results.loading}</div>;
}
