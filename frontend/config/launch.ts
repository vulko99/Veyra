// ---------------------------------------------------------------------------
// Pre-launch mode.
//
// Veyra's funnel collects a name, phone, email, income and employment status,
// and its consent text says Veyra will process and share that data. Until a
// registered legal entity exists to BE that data controller — and at least one
// partner is signed to receive the data — the funnel must not accept real
// submissions.
//
// Pre-launch keeps the whole informational site live and indexable (calculator,
// guides, loan-purpose pages, legal pages) and disables only /apply and
// /results. That way the SEO clock can start running months before launch,
// which is the one part of the timeline that cannot be compressed later.
//
// DEFAULT IS ON. You must explicitly set NEXT_PUBLIC_PRELAUNCH=false to accept
// applications — the same default-deny stance as the cookie gate and the
// regulated-values build guard. Forgetting an env var must never result in
// collecting personal data on behalf of an entity that does not exist.
//
// Before setting it to false, confirm ALL of:
//   1. the company is registered and config/company.ts values are supplied;
//   2. at least one partner is signed and published in config/partners.ts;
//   3. the disclosures in config/disclosures.ts are filled in;
//   4. NEXT_PUBLIC_API_URL points at the real backend, not the localhost
//      fallback — otherwise the funnel collects a phone number and then fails
//      at submit.
// ---------------------------------------------------------------------------

export const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH !== "false";

/** Where a primary call-to-action should point while the funnel is closed. */
export const PRELAUNCH_CTA_HREF = "/kalkulator";

/**
 * Where a *secondary* call-to-action should point while the funnel is closed.
 *
 * Must never equal PRELAUNCH_CTA_HREF. Pre-launch rewrites the primary CTA to
 * the calculator, so a secondary that also pointed there would render two
 * buttons, side by side, to the same page — which is what the landing hero did
 * before this existed. The pairing here matches PrelaunchNotice: calculator
 * first, guides as the alternative.
 */
export const PRELAUNCH_SECONDARY_HREF = "/guides";
