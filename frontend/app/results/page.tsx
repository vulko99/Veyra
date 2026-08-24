"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMatches, routeToPartner } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Match } from "@/types";

function ResultsInner() {
  const params = useSearchParams();
  const applicationId = params.get("application");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routing, setRouting] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setError("No application reference was provided.");
      return;
    }
    getMatches(applicationId)
      .then((res) => setMatches(res.matches))
      .catch(() => setError("We could not load your options. Please try again."));
  }, [applicationId]);

  async function handleContinue(match: Match) {
    if (!applicationId) return;
    setRouting(match.product_id);
    try {
      const res = await routeToPartner(applicationId, match.product_id);
      window.location.href = res.outbound_url;
    } catch {
      setError("We could not open the partner link. Please try again.");
      setRouting(null);
    }
  }

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-accent-600">Your options</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">
          Potentially relevant options
        </h1>
        <p className="mt-3 text-slate-600">
          These options match the information you provided. Veyra is a
          marketplace — the final decision is made by the lender, not by Veyra.
        </p>

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
              No relevant options right now
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Based on what you told us, we did not find a relevant partner
              product at this time. You can adjust your request and try again.
            </p>
            <div className="mt-6">
              <Link href="/apply/amount" className="btn-ghost">
                Adjust my request
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
                    Appears relevant
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Fact
                    label="Amount range"
                    value={`${formatCurrency(match.min_amount, match.currency)} – ${formatCurrency(
                      match.max_amount,
                      match.currency
                    )}`}
                  />
                  <Fact
                    label="Term range"
                    value={`${match.min_term_months}–${match.max_term_months} months`}
                  />
                  <Fact label="Type" value={humanType(match.product_type)} />
                </div>

                {match.reasons.length > 0 && (
                  <ul className="mt-5 space-y-1.5">
                    {match.reasons.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-0.5 text-accent-500">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    The final decision is made by {match.lender_name}.
                  </p>
                  <button
                    type="button"
                    className="btn-accent px-5 py-2.5 text-sm"
                    disabled={routing === match.product_id}
                    onClick={() => handleContinue(match)}
                  >
                    {routing === match.product_id
                      ? "Opening…"
                      : "Continue to partner"}
                  </button>
                </div>
              </div>
            ))}

            <p className="pt-2 text-center text-xs text-slate-500">
              This is not an offer of credit. &ldquo;Appears relevant&rdquo;
              reflects compatibility with published criteria, not a probability
              of approval.
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

function humanType(t: string): string {
  return t
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="container-x py-14">Loading…</div>}>
      <ResultsInner />
    </Suspense>
  );
}
