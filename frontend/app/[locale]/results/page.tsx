"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "@/components/LocaleLink";
import { useSearchParams } from "next/navigation";
import {
  getApplication,
  getMatches,
  selectPartner,
  submitEgn,
  submitApplication,
} from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useI18n } from "@/hooks/useI18n";
import { useApplication } from "@/hooks/useApplication";
import { AppShell } from "@/components/WizardStep";
import { CreditWarning } from "@/components/CreditWarning";
import type { Phase2Application, Phase2Match } from "@/types";

/** Compact dark matching motif: request → engine → matches, animated routes.
 *  `requestValue` is the applicant's own amount and term — never a placeholder. */
function ResultsViz({ count, requestValue }: { count: number; requestValue: string }) {
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
            {requestValue}
          </p>
        </div>

        <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
          <defs>
            {/* userSpaceOnUse: the path below is a straight horizontal line, so
                its bounding box has zero height and an objectBoundingBox
                gradient would be undefined — the browser paints nothing, and
                the animated dashes silently disappear against the static track
                underneath. Same failure as the vertical connectors on
                /how-it-works. */}
            <linearGradient
              id="rg"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="200"
              y2="0"
            >
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

type Referral = { partner: string; outbound_url: string };

function ResultsInner() {
  const params = useSearchParams();
  const { m } = useI18n();
  const r = m.results;
  const applicationId = params.get("application");
  const { draft, publicId } = useApplication();
  const [application, setApplication] = useState<Phase2Application | null>(null);
  const [matches, setMatches] = useState<Phase2Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"browse" | "egn" | "confirm" | "success">("browse");
  const [chosen, setChosen] = useState<Phase2Match[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [egn, setEgn] = useState("");
  const [egnError, setEgnError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Referral[] | null>(null);

  // Whether any selected partner needs the EGN (identity) step.
  const egnNeeded = chosen.some((c) => c.egn_required);

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

  // Supplementary: the request summary shown above the matches. The stored
  // application is authoritative — a results link opened in a fresh browser has
  // no local draft. A failure here must not break the page; the draft below
  // stands in, and failing that the summary is omitted entirely.
  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    getApplication(applicationId)
      .then((app) => {
        if (!cancelled) setApplication(app);
      })
      .catch(() => {
        if (!cancelled) setApplication(null);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const toggle = (m: Phase2Match) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m.product_id)) next.delete(m.product_id);
      else {
        next.add(m.product_id);
        track("partner_selected", { partner_slug: m.partner_slug, rank: m.ranking });
      }
      return next;
    });
  };

  // Step 1: persist the partner selection (creates a referral per chosen
  // partner), then route to the EGN step if any selected partner needs it,
  // otherwise straight to final confirmation.
  async function beginContinue() {
    if (!applicationId || !matches) return;
    setSubmitting(true);
    setError(null);
    try {
      const picked = matches.filter((m) => selected.has(m.product_id));
      const created: Referral[] = [];
      for (const m of picked) {
        const res = await selectPartner(applicationId, m.product_id);
        created.push({ partner: res.partner, outbound_url: res.outbound_url });
      }
      setChosen(picked);
      setReferrals(created);
      setEgn("");
      setEgnError(null);
      setPhase(picked.some((m) => m.egn_required) ? "egn" : "confirm");
    } catch {
      setError(r.routeError);
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2 (only when required): submit the EGN, then go to confirmation. The
  // EGN lives only in component state — never localStorage/sessionStorage/URL.
  async function submitIdentity() {
    if (!applicationId) return;
    if (!/^\d{10}$/.test(egn)) {
      setEgnError(r.egnInvalid);
      return;
    }
    setSubmitting(true);
    setEgnError(null);
    try {
      await submitEgn(applicationId, egn);
      setEgn(""); // drop the plaintext from memory once accepted
      setPhase("confirm");
    } catch {
      setEgnError(r.egnInvalid);
    } finally {
      setSubmitting(false);
    }
  }

  // Step 3: final confirmation → submit to the selected partner(s) → success.
  async function confirmAndSubmit() {
    if (!applicationId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitApplication(applicationId);
      setDone(referrals);
      setPhase("success");
    } catch {
      setError(r.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  const productTypeLabel = (pt: string) =>
    (r.productTypes as Record<string, string>)[pt] ?? pt.replace(/_/g, " ");

  // What the applicant actually asked for. The stored application is
  // authoritative; the local draft only stands in when it belongs to this same
  // application (a shared link can point at a different one). Never
  // home.viz.requestValue — that is a fixed marketing illustration and would
  // misstate the request on the page where the applicant decides.
  const draftIsThisApplication = publicId != null && publicId === applicationId;
  const requestedAmount =
    application?.desired_amount_eur ??
    (draftIsThisApplication ? draft.requested_amount : undefined);
  const requestedTerm =
    application?.desired_term_months ??
    (draftIsThisApplication ? draft.requested_term_months : undefined);
  const requestValue =
    requestedAmount && requestedTerm != null
      ? `${formatEUR(requestedAmount)} · ${requestedTerm} ${r.months}`
      : null;

  // ----- Success screen (after referrals are created) -----
  if (done) {
    return (
      <AppShell current="results">
        <div className="mx-auto w-full max-w-2xl pt-10 sm:pt-16">
          <div className="reveal text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint/15 text-2xl text-mint-400">
              ✓
            </span>
            <h1 className="mt-5 text-[2rem] font-bold leading-[1.08] tracking-tight text-appwhite sm:text-[2.4rem]">
              {r.successTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-appmuted">{r.successSubhead}</p>
          </div>

          {/* Mandatory credit warning — required on any view that advertises
              credit, which includes the results/comparison view. */}
          <div className="reveal mt-8">
            <CreditWarning tone="dark" />
          </div>

          <div className="reveal mt-8">
            <p className="text-xs uppercase tracking-[0.14em] text-appmuted">
              {r.successSelected}
            </p>
            <div className="mt-3 space-y-3">
              {done.map((d) => (
                <div
                  key={d.partner}
                  className="flex items-center gap-4 rounded-2xl border border-appborder bg-appsurface p-5"
                >
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-white/10 bg-white/5 font-display text-base font-extrabold text-appwhite">
                    {d.partner.charAt(0)}
                  </span>
                  <span className="font-display text-base font-bold text-appwhite">
                    {d.partner}
                  </span>
                  {d.outbound_url && (
                    <a
                      href={d.outbound_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-btn-ghost ml-auto text-sm"
                      onClick={() => track("partner_clicked", { partner: d.partner })}
                    >
                      {r.openPartner}
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-appmuted">
              {r.successDisclaimer}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ----- Identity (EGN) step — only when a selected partner requires it -----
  if (phase === "egn") {
    return (
      <AppShell current="results">
        <div className="mx-auto w-full max-w-xl pt-10 sm:pt-16">
          <div className="reveal">
            <h1 className="text-[1.9rem] font-bold leading-[1.1] tracking-tight text-appwhite sm:text-[2.3rem]">
              {r.egnTitle}
            </h1>
            <p className="mt-3 text-appmuted">{r.egnBody}</p>

            <div className="mt-8">
              <label htmlFor="egn" className="text-sm font-semibold text-appwhite">
                {r.egnLabel}
              </label>
              <input
                id="egn"
                name="egn"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={egn}
                placeholder={r.egnPlaceholder}
                aria-invalid={egnError ? true : undefined}
                onChange={(e) => {
                  // Digits only; never store formatted or partial non-numeric.
                  setEgn(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (egnError) setEgnError(null);
                }}
                className="mt-2 w-full rounded-xl border border-appborder bg-appsurface px-4 py-3 font-display text-lg tracking-wide text-appwhite tabular-nums outline-none focus:border-mint"
              />
              {egnError && (
                <p role="alert" className="mt-2 text-sm font-semibold text-red-400">
                  {egnError}
                </p>
              )}

              {/* Privacy notice for the EGN + link to the Privacy Notice. */}
              <div className="mt-4 rounded-xl border border-appborder bg-appsurface/60 p-4">
                <p className="text-sm leading-relaxed text-appmuted">{r.egnPrivacyNotice}</p>
                <Link
                  href="/privacy"
                  className="mt-2 inline-block text-sm font-medium text-mint-400 underline underline-offset-4 hover:text-mint"
                >
                  {r.privacyLink}
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                className="a-btn-ghost"
                disabled={submitting}
                onClick={() => setPhase("browse")}
              >
                {r.back}
              </button>
              <button
                type="button"
                className="btn-mint"
                disabled={submitting || egn.length !== 10}
                onClick={submitIdentity}
              >
                {submitting ? r.processing : r.egnContinue}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ----- Final confirmation — which partners receive the data -----
  if (phase === "confirm") {
    return (
      <AppShell current="results">
        <div className="mx-auto w-full max-w-xl pt-10 sm:pt-16">
          <div className="reveal">
            <h1 className="text-[1.9rem] font-bold leading-[1.1] tracking-tight text-appwhite sm:text-[2.3rem]">
              {r.confirmMultiTitle}
            </h1>
            <p className="mt-3 text-appmuted">
              {chosen.length === 1
                ? `${r.confirmSinglePrefix}${chosen[0].partner}.`
                : r.confirmMultiInfo}
            </p>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.14em] text-appmuted">
                {r.recipientsTitle}
              </p>
              <div className="mt-3 space-y-2">
                {chosen.map((c) => (
                  <div
                    key={c.product_id}
                    className="flex items-center gap-3 rounded-xl border border-appborder bg-appsurface p-4"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-mint/15 text-xs text-mint-400">
                      ✓
                    </span>
                    <span className="font-display text-base font-bold text-appwhite">
                      {c.partner}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <Link
                href="/privacy"
                className="text-sm font-medium text-mint-400 underline underline-offset-4 hover:text-mint"
              >
                {r.privacyLink}
              </Link>
            </div>

            <CreditWarning tone="dark" className="mt-6" />
            <p className="mt-4 text-xs leading-relaxed text-appmuted">{r.successDisclaimer}</p>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                className="a-btn-ghost"
                disabled={submitting}
                onClick={() => setPhase(egnNeeded ? "egn" : "browse")}
              >
                {r.back}
              </button>
              <button
                type="button"
                className="btn-mint"
                disabled={submitting}
                onClick={confirmAndSubmit}
              >
                {submitting ? r.processing : r.confirmSubmit}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell current="results">
      <div className="mx-auto w-full max-w-2xl pb-28 pt-8 sm:pt-12">
        <div className="reveal">
          <span className="a-eyebrow">{r.eyebrow}</span>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.06] tracking-tight text-appwhite sm:text-[2.6rem]">
            {matches && matches.length === 0
              ? r.emptyHeadline
              : matches && matches.length > 1
                ? r.titleMultiple
                : r.title}
          </h1>
          <p className="mt-3 text-appmuted">
            {matches && matches.length === 0 ? r.emptySubhead : r.subhead}
          </p>

          {/* Mandatory credit warning — required on any view that advertises
              credit, which includes the results/comparison view. */}
          <CreditWarning tone="dark" className="mt-6" />

          {/* ЗЗП чл. 47а — the ranking disclosure has to be reachable from the
              ranked view itself, not only from the footer. */}
          <p className="mt-4 text-sm">
            <Link
              href="/kak-podrezhdame-ofertite"
              className="font-medium text-mint-400 underline underline-offset-4 hover:text-mint"
            >
              {m.footer.links.ranking}
            </Link>
          </p>

          {matches && matches.length > 0 && (
            <>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 text-sm font-semibold text-mint-400">
                <span className="font-display text-base font-extrabold text-appwhite">
                  {matches.length}
                </span>
                {r.countSuffix}
              </div>
              {requestValue && (
                <div className="mt-6">
                  <ResultsViz count={matches.length} requestValue={requestValue} />
                </div>
              )}
              <p className="mt-4 text-sm text-appmuted">{r.selectHint}</p>
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
              const isSel = selected.has(match.product_id);
              return (
                <article
                  key={match.product_id}
                  className={`overflow-hidden rounded-2xl border bg-appsurface transition-colors ${
                    isSel
                      ? "border-mint shadow-[0_0_0_1px_rgba(33,199,168,0.5)]"
                      : top
                        ? "border-mint/50"
                        : "border-appborder"
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
                            <span className="font-display text-sm font-extrabold text-appwhite">
                              {match.compatibility_score}%
                            </span>{" "}
                            {r.matchSuffix}
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
                        aria-pressed={isSel}
                        className={isSel ? "btn-mint w-full sm:w-auto" : "a-btn-ghost w-full sm:w-auto"}
                        onClick={() => toggle(match)}
                      >
                        {isSel ? `✓ ${r.selectedLabel}` : r.selectLabel}
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

      {/* Sticky action bar — continue with all selected partners. Selection is
          persisted here; EGN (if required) and final confirmation follow. */}
      {matches && matches.length > 0 && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-appborder bg-appsurface/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-appmuted">
              <span className="font-display font-bold text-appwhite">{selected.size}</span>{" "}
              {r.selectedLabel.toLowerCase()}
            </span>
            <button
              type="button"
              className="btn-mint"
              disabled={submitting}
              onClick={beginContinue}
            >
              {submitting ? r.processing : r.continueSelected}
              <span aria-hidden>→</span>
            </button>
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
