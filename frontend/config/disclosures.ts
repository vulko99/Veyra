// ---------------------------------------------------------------------------
// Mandatory advertising disclosures.
//
// Required by BOTH:
//   * Google Ads' financial-products policy — which applies identically to
//     lenders, lead generators and comparison sites; being an intermediary is
//     NOT an exemption. Without these, paid traffic cannot run at all.
//   * ЗПК чл. 25 — standard information + a representative example, presented
//     in type NO LESS PROMINENT than the rest of the advertisement.
//
// Every value here describes the PANEL OF PARTNERS as a whole, not one product.
// None of it may be invented: unconfirmed values stay [[TODO:*]] placeholders,
// and <LegalDisclosures> renders an unmissable "unfilled" state when it sees
// one. See TODO-LEGAL.md.
// ---------------------------------------------------------------------------

export type Disclosures = {
  /** Shortest repayment period offered across the partner panel, in months. */
  termMinMonths: string;
  /** Longest repayment period offered across the partner panel, in months. */
  termMaxMonths: string;
  /** Highest ГПР across the panel. Stated SEPARATELY from the example. */
  maxAPR: string;
  /** Every applicable fee, as a human-readable Bulgarian list. */
  fees: string;
  /** Physical business address (required by Google Ads policy). */
  address: string;
};

export const DISCLOSURES: Disclosures = {
  termMinMonths: "[[TODO:TERM_MIN]]",
  termMaxMonths: "[[TODO:TERM_MAX]]",
  maxAPR: "[[TODO:MAX_APR]]",
  fees: "[[TODO:FEES_LIST]]",
  address: "[[TODO:REGISTERED_ADDRESS]]",
};

// --- Representative example (ЗПК чл. 25) -----------------------------------
// Must be supplied or approved by a partner. Do NOT compute it from the
// calculator: a synthesised example is a fabricated financial promotion.
export type RepresentativeExample = {
  amountEur: string;
  termMonths: string;
  /** Fixed annual borrowing rate, % */
  ratePct: string;
  /** ГПР, % */
  aprPct: string;
  /** Total amount repayable, EUR */
  totalEur: string;
  /** Monthly instalment, EUR */
  monthlyEur: string;
};

export const REPRESENTATIVE_EXAMPLE: RepresentativeExample = {
  amountEur: "[[TODO:EXAMPLE_AMOUNT]]",
  termMonths: "[[TODO:EXAMPLE_TERM]]",
  ratePct: "[[TODO:EXAMPLE_RATE]]",
  aprPct: "[[TODO:EXAMPLE_APR]]",
  totalEur: "[[TODO:EXAMPLE_TOTAL]]",
  monthlyEur: "[[TODO:EXAMPLE_MONTHLY]]",
};

/** True while ANY disclosure value is still an unfilled placeholder. */
export const DISCLOSURES_INCOMPLETE: boolean = [
  ...Object.values(DISCLOSURES),
  ...Object.values(REPRESENTATIVE_EXAMPLE),
].some((v) => v.startsWith("[[TODO:"));

// --- Google Ads: no sub-60-day personal loans ------------------------------
// Google prohibits ADVERTISING personal loans requiring full repayment within
// 60 days. Bulgarian "кредит до заплата" products are typically 30-day.
// Organic targeting of those terms is fine and intended; paid landing pages
// must filter them out. `adEligible: false` on a product/landing carries that.
export const MIN_AD_ELIGIBLE_TERM_DAYS = 60;
