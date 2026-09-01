// ---------------------------------------------------------------------------
// Real, signed lender partners.
//
// Named lenders are the borrowed trust this whole model runs on — and exactly
// why they must never be fabricated. This list is EMPTY until partners are
// contractually signed AND have authorised use of their name and logo.
//
// While it is empty:
//   * the homepage renders a non-specific illustration instead of named cards;
//   * /partners renders the editorial "for lenders" page with no name claims.
//
// To add a partner, append an entry and drop its logo in /public/partners/.
// Do NOT add a lender that is merely in conversation — the backend tracks
// pipeline status (Lender.status = PENDING); this file is publication only.
// ---------------------------------------------------------------------------

export type Partner = {
  /** Consumer-facing name, exactly as the partner authorises it. */
  name: string;
  /** Path under /public, e.g. "/partners/example.svg". */
  logo: string;
  /** The lender's own website. */
  url: string;
  /** Short factual description, supplied or approved by the partner. */
  description?: string;
};

// [[TODO:PARTNER_LIST]] — no partners are signed and cleared for publication.
export const PARTNERS: Partner[] = [];

export const HAS_PARTNERS = PARTNERS.length > 0;
