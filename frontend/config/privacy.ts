// ---------------------------------------------------------------------------
// Privacy Notice configuration.
//
// The Privacy Notice content lives in i18n (privacy.*). This file holds the
// STRUCTURED, non-copy configuration: the notice version and the partner
// disclosure list.
//
// NOTHING legally sensitive here may be invented. Partner legal identity,
// legal basis, retention periods, DPO details and regulatory statements are
// NOT filled in until Veyra's legal counsel provides them — they are marked
// with LEGAL_REVIEW. Companies are listed as POTENTIAL recipients only; none is
// presented as a legally confirmed partner until its agreement is finalised.
// ---------------------------------------------------------------------------

/** Bump when the Privacy Notice content materially changes. Recorded against
 *  consent (backend PRIVACY_NOTICE_VERSION must be kept in step). */
export const PRIVACY_NOTICE_VERSION = "1.0";

/** Marker for any value pending legal review. Rendered, never hidden. */
export const LEGAL_REVIEW = "[LEGAL REVIEW REQUIRED]";

export type PartnerPrivacyProfile = {
  /** Consumer-facing name (as provided). */
  name: string;
  /** Verified legal name, or LEGAL_REVIEW until confirmed. */
  legalName: string;
  /** Company registration number (ЕИК), or LEGAL_REVIEW. */
  registrationNumber: string;
  /** Registered address, or LEGAL_REVIEW. */
  registeredAddress: string;
  /** Link to the partner's own privacy policy, or LEGAL_REVIEW. */
  privacyUrl: string;
  /** GDPR role for the data received, or LEGAL_REVIEW. */
  recipientRole: string;
  /** Whether EGN is among the data that may be shared with this partner. */
  egnShared: boolean;
  /** Whether the partner agreement is finalised and the profile verified. */
  verified: boolean;
  /** Fictional demo partner — must never be presented as a real partner. */
  demo: boolean;
};

// Potential recipients. Names were provided by Veyra; ALL legal identity fields
// are pending counsel and each is marked LEGAL_REVIEW. `verified: false` means
// the agreement is not finalised — the UI shows these as pending, never as
// confirmed partners. No demo partners are listed as real recipients here.
export const PARTNER_PRIVACY_PROFILES: PartnerPrivacyProfile[] = [
  profile("Iute", { egnShared: true }),
  profile("MoneyPlus", { egnShared: false }),
  profile("VivaCredit", { egnShared: false }),
  profile("CashCredit", { egnShared: false }),
  profile("NewCard", { egnShared: false }),
];

function profile(
  name: string,
  opts: { egnShared: boolean }
): PartnerPrivacyProfile {
  return {
    name,
    legalName: LEGAL_REVIEW,
    registrationNumber: LEGAL_REVIEW,
    registeredAddress: LEGAL_REVIEW,
    privacyUrl: LEGAL_REVIEW,
    recipientRole: LEGAL_REVIEW,
    egnShared: opts.egnShared,
    verified: false,
    demo: false,
  };
}

/** Partners whose agreement is finalised and profile verified (public-ready). */
export const VERIFIED_PARTNER_PROFILES = PARTNER_PRIVACY_PROFILES.filter(
  (p) => p.verified && !p.demo
);
