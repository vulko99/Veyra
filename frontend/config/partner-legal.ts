// ---------------------------------------------------------------------------
// Per-partner legal & product information ("Задължителна информация").
//
// This is the structured, per-partner source of truth for the regulated
// product facts Veyra displays for each lending partner: repayment term,
// product APR, applicable fees, registered address and the ЗПК чл. 25
// representative example.
//
// NON-NEGOTIABLE RULES (see also config/legal.ts, TODO-LEGAL.md):
//
//   1. NOTHING here may be invented, estimated or inferred. Every value must
//      come verbatim from an official partner source (tariff, offer, contract,
//      PDF, or the partner's own website) recorded in `sourceDocument`.
//
//   2. A missing value is `null` — never a plausible-looking number and never
//      a placeholder string. A partner with any mandatory value missing is
//      simply NOT PUBLISHABLE; it may still exist here internally as a draft.
//
//   3. Publication is gated by `validatePartnerLegal()`. A partner product is
//      shown to the public ONLY when every mandatory field is present, the
//      representative example is internally consistent, the product APR does
//      not exceed the statutory cap, and `reviewStatus === "verified"`.
//
//   4. The representative example is used EXACTLY as the partner supplied it.
//      We never synthesise one from the calculator or from an arbitrary rate —
//      a synthesised financial promotion is fabricated. We only CHECK the
//      partner's official figures for internal consistency.
//
//   5. "Максимален ГПР" (this partner's product APR ceiling, `maxAprPct`) and
//      "Законов таван на ГПР" (the statutory cap in config/legal.ts, APR_CAP)
//      are DIFFERENT things and are kept as separate fields. Never present the
//      statutory cap as a partner's APR.
//
// Adding a partner is adding a data entry below — the page never changes.
// ---------------------------------------------------------------------------

import { APR_CAP } from "@/config/legal";

/** Where a partner is in Veyra's internal legal-review pipeline. */
export type LegalReviewStatus = "draft" | "in_review" | "verified";

/**
 * Applicable fees. `null` on the partner means NOT YET CONFIRMED (do not claim
 * "no fees"). To state that there are no fees, a partner must be explicitly set
 * to `{ kind: "none" }` — i.e. the partner confirmed it in writing.
 */
export type PartnerFees =
  | { kind: "list"; items: string[] } // itemised applicable fees, BG text
  | { kind: "none" }; // partner has explicitly CONFIRMED there are no fees

/**
 * The ЗПК чл. 25 representative example. All six values belong to ONE example
 * and must be the partner's official figures. Numbers, not strings, so they can
 * be consistency-checked and formatted for the active locale.
 */
export type RepresentativeExample = {
  /** Заета сума, EUR. */
  amountEur: number;
  /** Срок, месеца. */
  termMonths: number;
  /** Фиксиран годишен лихвен процент (ГЛП), %. */
  annualInterestRatePct: number;
  /** Годишен процент на разходите (ГПР), %. */
  aprPct: number;
  /** Обща дължима сума, EUR. */
  totalPayableEur: number;
  /** Месечна вноска, EUR. */
  monthlyPaymentEur: number;
};

export type PartnerLegal = {
  /** Internal stable key. */
  slug: string;
  /** Consumer-facing name, exactly as the partner authorises it. */
  name: string;
  /**
   * Official REGISTERED company address (седалище и адрес на управление), not a
   * branch or marketing address unless that is the legally required address.
   */
  registeredAddress: string | null;
  /** Shortest repayment term offered, in months. */
  termMinMonths: number | null;
  /** Longest repayment term offered, in months. */
  termMaxMonths: number | null;
  /**
   * Highest ГПР reachable on this partner's product. This is the PARTNER's
   * product figure — NOT the statutory cap (APR_CAP in config/legal.ts).
   */
  maxAprPct: number | null;
  /** Applicable fees. `null` = not yet confirmed (never assume "no fees"). */
  fees: PartnerFees | null;
  /** The partner's official representative example, used verbatim. */
  representativeExample: RepresentativeExample | null;
  /** ISO 8601 date (YYYY-MM-DD) the legal/product data was last confirmed. */
  lastUpdated: string | null;
  /**
   * Internal provenance: where every value above came from — e.g.
   * "Тарифа v3, PDF, получена по имейл 2026-08-14" or a document URL. Recorded
   * so any published figure can be traced back to a verified partner source.
   */
  sourceDocument: string | null;
  /** Legal-review state. Only "verified" partners can be published. */
  reviewStatus: LegalReviewStatus;
};

// ---------------------------------------------------------------------------
// Partner registry.
//
// INTERNAL PIPELINE — not a publication list. Entries may be incomplete drafts;
// the validator below decides what is publishable. These names are recorded for
// internal tracking of partners in conversation. NO financial, pricing, APR,
// fee, address or representative-example value has been supplied for any of
// them yet, so every such field is `null` and every status is "draft". Nothing
// here reaches the public page until it is verified and complete.
//
// To onboard a partner: fill the fields from the partner's OFFICIAL documents,
// set `sourceDocument` and `lastUpdated`, then move `reviewStatus` to
// "verified" once Veyra's legal review signs it off.
// ---------------------------------------------------------------------------

const draft = (slug: string, name: string): PartnerLegal => ({
  slug,
  name,
  registeredAddress: null,
  termMinMonths: null,
  termMaxMonths: null,
  maxAprPct: null,
  fees: null,
  representativeExample: null,
  lastUpdated: null,
  sourceDocument: null,
  reviewStatus: "draft",
});

export const PARTNER_LEGAL: PartnerLegal[] = [
  draft("moneyplus", "MoneyPlus"),
  draft("iute", "Iute"),
  draft("vivacredit", "VivaCredit"),
  draft("cashcredit", "CashCredit"),
  draft("newcard", "NewCard"),
];

// ---------------------------------------------------------------------------
// Validation — the publication gate.
// ---------------------------------------------------------------------------

/** Mandatory fields. A partner cannot be published while any is missing. */
export const MANDATORY_FIELDS = [
  "registeredAddress",
  "termMinMonths",
  "termMaxMonths",
  "maxAprPct",
  "fees",
  "representativeExample",
  "lastUpdated",
  "sourceDocument",
  "reviewStatus=verified",
] as const;

export type ValidationResult = {
  /** True only when the product may be shown publicly. */
  publishable: boolean;
  /** Mandatory fields still missing (human-readable keys). */
  missing: string[];
  /** Data-integrity problems (e.g. an inconsistent representative example). */
  issues: string[];
};

const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

/**
 * Checks that the partner's OWN representative example is internally
 * consistent. This never recomputes or replaces the partner's figures — it only
 * flags a set of numbers that cannot describe the same loan (a data-entry error
 * to resolve WITH the partner, not for us to "fix").
 */
export function exampleConsistency(ex: RepresentativeExample): string[] {
  const issues: string[] = [];
  const positives: [keyof RepresentativeExample, string][] = [
    ["amountEur", "сума"],
    ["termMonths", "срок"],
    ["annualInterestRatePct", "ГЛП"],
    ["aprPct", "ГПР"],
    ["totalPayableEur", "обща сума"],
    ["monthlyPaymentEur", "месечна вноска"],
  ];
  for (const [key, label] of positives) {
    if (!isNum(ex[key]) || ex[key] <= 0) {
      issues.push(`представителен пример: ${label} липсва или не е валидна`);
    }
  }
  if (issues.length) return issues;

  // ГПР includes fees, so it can never be below the nominal borrowing rate.
  if (ex.aprPct < ex.annualInterestRatePct) {
    issues.push("представителен пример: ГПР е по-нисък от ГЛП");
  }
  // Total repayable can never be less than the amount borrowed.
  if (ex.totalPayableEur < ex.amountEur) {
    issues.push("представителен пример: общата дължима сума е под заетата сума");
  }
  // monthly × term should reconcile with the total, allowing for rounding of
  // the final instalment. Tolerance: the larger of €1.50 or 1% of the total.
  const reconstructed = ex.monthlyPaymentEur * ex.termMonths;
  const tolerance = Math.max(1.5, ex.totalPayableEur * 0.01);
  if (Math.abs(reconstructed - ex.totalPayableEur) > tolerance) {
    issues.push(
      "представителен пример: месечна вноска × срок не съответства на общата дължима сума"
    );
  }
  return issues;
}

/**
 * Decides whether a partner's legal/product data may be published, and reports
 * exactly what is missing or inconsistent. Pure — safe to call from the UI and
 * from the internal report.
 */
export function validatePartnerLegal(p: PartnerLegal): ValidationResult {
  const missing: string[] = [];
  const issues: string[] = [];

  if (!p.registeredAddress) missing.push("registeredAddress");
  if (!isNum(p.termMinMonths)) missing.push("termMinMonths");
  if (!isNum(p.termMaxMonths)) missing.push("termMaxMonths");
  if (!isNum(p.maxAprPct)) missing.push("maxAprPct");
  if (!p.fees) missing.push("fees");
  if (!p.representativeExample) missing.push("representativeExample");
  if (!p.lastUpdated) missing.push("lastUpdated");
  if (!p.sourceDocument) missing.push("sourceDocument");
  if (p.reviewStatus !== "verified") missing.push("reviewStatus=verified");

  // Cross-field integrity checks (only meaningful once the values exist).
  if (isNum(p.termMinMonths) && isNum(p.termMaxMonths) && p.termMinMonths > p.termMaxMonths) {
    issues.push("termMin е по-голям от termMax");
  }
  // A product APR above the statutory cap could not lawfully be advertised.
  if (isNum(p.maxAprPct) && p.maxAprPct > APR_CAP.value) {
    issues.push(
      `Максимален ГПР (${p.maxAprPct}%) надвишава законовия таван (${APR_CAP.value}%)`
    );
  }
  if (p.representativeExample) {
    issues.push(...exampleConsistency(p.representativeExample));
    // The example's APR must also respect the statutory cap.
    if (p.representativeExample.aprPct > APR_CAP.value) {
      issues.push(
        `представителен пример: ГПР (${p.representativeExample.aprPct}%) надвишава законовия таван`
      );
    }
  }

  return { publishable: missing.length === 0 && issues.length === 0, missing, issues };
}

/** Partners cleared for public display (all mandatory fields present & valid). */
export function publishablePartners(): PartnerLegal[] {
  return PARTNER_LEGAL.filter((p) => validatePartnerLegal(p).publishable);
}

export const HAS_PUBLISHABLE_PARTNER_LEGAL = publishablePartners().length > 0;

/**
 * Full internal status report — powers admin views and the onboarding
 * checklist. Never rendered on the public page.
 */
export function partnerLegalReport() {
  return PARTNER_LEGAL.map((p) => {
    const v = validatePartnerLegal(p);
    const populated = MANDATORY_FIELDS.filter(
      (f) => !v.missing.includes(f)
    );
    return {
      slug: p.slug,
      name: p.name,
      reviewStatus: p.reviewStatus,
      publishable: v.publishable,
      populated,
      missing: v.missing,
      issues: v.issues,
    };
  });
}

// ---------------------------------------------------------------------------
// Bulgarian display formatting. Applied only to already-verified numbers — it
// never creates a value, only formats one for the locale.
// ---------------------------------------------------------------------------

/** "2000" -> "2 000" ; "1234.5" -> "1 234,5". Bulgarian grouping + decimal. */
export function bgAmount(n: number): string {
  return new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 2 }).format(n);
}

/** "20.5" -> "20,50%". Two decimals, Bulgarian comma. */
export function bgPct(n: number): string {
  return `${n.toFixed(2).replace(".", ",")}%`;
}

/** ISO "2026-09-01" -> "01.09.2026". */
export function bgDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}
