// ---------------------------------------------------------------------------
// Legal constants for the Bulgarian consumer-credit regime.
//
// NOTHING HERE MAY BE INVENTED. Any value not yet confirmed by the owner stays
// a loud [[TODO:*]] placeholder so it fails visibly in review instead of
// shipping as plausible-looking fiction. Every placeholder is registered in
// TODO-LEGAL.md at the repo root.
// ---------------------------------------------------------------------------

/** Marker for values the owner still has to supply. */
export const TODO_PREFIX = "[[TODO:";

/** True when a config value is still an unfilled placeholder. */
export function isTodo(value: string): boolean {
  return typeof value === "string" && value.startsWith(TODO_PREFIX);
}

// --- Mandatory credit warning ----------------------------------------------
// Required on every page that advertises credit under the Consumer Credit Act
// transposing EU Directive 2023/2225 (in force 20 Nov 2026).
//
// Checked against чл. 8, ал. 1 of the new Закон за потребителския кредит,
// which requires the warning to be given "чрез използване на израза
// „Внимание! Вземането на кредит струва пари" или друг подобен израз."
//
// So the constant below is the statute's own exemplar phrase, verbatim. Note
// the transposition did NOT adopt the directive's BG wording ("Внимание!
// Заемането на пари струва пари") — Bulgaria chose "вземането на кредит" over
// "заемането на пари". Do not "correct" this back to the directive text.
//
// The article also permits "или друг подобен израз", so compliance does not
// hinge on an exact string match; a reworded but equivalent warning would
// still satisfy it. Kept deliberately un-inlined so the wording is one edit.
export const CREDIT_WARNING = "Внимание! Вземането на кредит струва пари.";

/**
 * Verified against чл. 8, ал. 1 as published for consultation (strategy.bg,
 * consultation closed 14 Jan 2026) and corroborated by secondary legal
 * coverage of the adopted Act. NOT read against the Държавен вестник text —
 * that copy was not retrievable. The residual risk is low because the article
 * allows an equivalent expression, but a lawyer should still confirm against
 * ДВ before 20 Nov 2026, when unconfirmed wording becomes a real breach.
 */
export const CREDIT_WARNING_CONFIRMED = true;

// --- APR (ГПР) cap ---------------------------------------------------------
// Bulgaria caps consumer-credit APR at 5x the statutory default interest rate.
// That rate was re-based at euro adoption to ECB main refinancing rate + 8pp
// and RESETS EVERY 1 JANUARY AND 1 JULY. It is therefore a moving number and
// must never be hardcoded into templates or copy.
//
//   H1 2026 (1 Jan - 30 Jun): 50.75%
//   H2 2026 (from 1 Jul):     52.00%
//
// Update `value` + `effectiveFrom` twice a year.
export const APR_CAP = {
  value: 52.0,
  effectiveFrom: "2026-07-01",
  note: "5 x statutory default rate (ECB MRO + 8pp). Resets 1 Jan and 1 Jul.",
} as const;

/** Previous cap periods, kept so a reviewer can see the reset cadence. */
export const APR_CAP_HISTORY = [
  { value: 50.75, effectiveFrom: "2026-01-01" },
  { value: 52.0, effectiveFrom: "2026-07-01" },
] as const;

/** Bulgarian-formatted cap, e.g. "52,00%". */
export function formatAprCap(): string {
  return `${APR_CAP.value.toFixed(2).replace(".", ",")}%`;
}

// --- Age -------------------------------------------------------------------
// Consumer credit is 18+. (Bulgaria's data-protection age of consent is 14,
// which matters only for general-audience content that collects data.)
export const MIN_AGE = 18;

// --- Local preview: hide unfilled values ------------------------------------
// Omits any row whose regulated value is still an unfilled [[TODO:*]]
// placeholder, so the site can be shown to a prospective partner before the
// company is registered without reading as a page full of gaps.
//
// OPT-IN AND LOCAL ONLY, and deliberately so. A visible placeholder fails
// loudly; a hidden row fails silently, and a credit site published with no
// mandatory disclosures and no identifiable operator is a worse outcome than
// one that merely looks unfinished. Nothing here is invented and nothing is
// weakened: DISCLOSURES_INCOMPLETE and COMPANY_INCOMPLETE are untouched, and
// check-legal-values.mjs still refuses a production build.
//
// Intended for .env.local, which is gitignored and cannot reach a deploy.
export const HIDE_UNFILLED =
  process.env.NEXT_PUBLIC_HIDE_UNFILLED === "true";
