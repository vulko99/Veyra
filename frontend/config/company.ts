// ---------------------------------------------------------------------------
// Legal identity of the operating entity.
//
// Rendered in the footer, on /about, in Organization JSON-LD, and in the
// Google-Ads-mandated disclosures. Registration numbers and addresses are
// exactly the class of value that must never be invented, so each falls back
// to a loud [[TODO:*]] placeholder rather than anything plausible.
//
// Supply at deploy time via environment variables (see .env.local.example).
// ---------------------------------------------------------------------------

import { CONTACT_EMAIL, PRIVACY_EMAIL } from "@/lib/site";

export const COMPANY = {
  /** Registered legal entity name, e.g. "Вейра ЕООД". */
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "[[TODO:COMPANY_LEGAL_NAME]]",
  /** ЕИК / UIC — Bulgarian company number. */
  eik: process.env.NEXT_PUBLIC_COMPANY_EIK || "[[TODO:COMPANY_EIK]]",
  /** VAT number, if registered. */
  vat: process.env.NEXT_PUBLIC_COMPANY_VAT || "[[TODO:COMPANY_VAT]]",
  /** Registered physical address (also a Google Ads requirement). */
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "[[TODO:REGISTERED_ADDRESS]]",
  /** Contact phone. */
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "[[TODO:CONTACT_PHONE]]",
  contactEmail: CONTACT_EMAIL,
  privacyEmail: PRIVACY_EMAIL,
} as const;

/** True while any identity field is still an unfilled placeholder. */
export const COMPANY_INCOMPLETE: boolean = Object.values(COMPANY).some(
  (v) => typeof v === "string" && v.startsWith("[[TODO:")
);

/**
 * Company fields formatted for schema.org, with unfilled placeholders OMITTED.
 *
 * Structured data is machine-consumed: emitting "[[TODO:COMPANY_EIK]]" as a
 * taxID would publish a fabricated-looking identifier to Google. A missing
 * field is correct; a placeholder one is not.
 */
export function companyJsonLdFields(): Record<string, unknown> {
  const filled = (v: string) => (v.startsWith("[[TODO:") ? undefined : v);
  const out: Record<string, unknown> = {};

  const legalName = filled(COMPANY.legalName);
  if (legalName) out.legalName = legalName;

  // ЕИК is the Bulgarian company registration number.
  const eik = filled(COMPANY.eik);
  if (eik) out.identifier = eik;

  const vat = filled(COMPANY.vat);
  if (vat) out.vatID = vat;

  const address = filled(COMPANY.address);
  if (address) {
    out.address = {
      "@type": "PostalAddress",
      addressCountry: "BG",
      streetAddress: address,
    };
  }

  const phone = filled(COMPANY.phone);
  if (phone) out.telephone = phone;

  // Contact email is env-driven and falls back to an obvious @veyra.example
  // placeholder, which must not be published either.
  if (!COMPANY.contactEmail.endsWith("@veyra.example")) {
    out.email = COMPANY.contactEmail;
  }

  return out;
}
