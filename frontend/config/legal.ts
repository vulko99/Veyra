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
// The wording below follows the draft Bulgarian statute. The directive's own
// official BG text reads "Внимание! Заемането на пари струва пари."
//
// [[TODO:WARNING_WORDING]] — CONFIRM against the final published statute
// before 20 Nov 2026 and update this single constant. It is deliberately not
// inlined anywhere so the change is one edit.
export const CREDIT_WARNING = "Внимание! Вземането на кредит струва пари.";

/** Set true once the wording is verified against the published Act. */
export const CREDIT_WARNING_CONFIRMED = false;

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
