// Configurable site-level values. Real production values come from environment
// variables at deploy time; the fallbacks are CLEARLY marked placeholders
// (@veyra.example) so nothing fake is ever presented as real production data.
//
//   NEXT_PUBLIC_CONTACT_EMAIL  — general contact address
//   NEXT_PUBLIC_PRIVACY_EMAIL  — data-protection / privacy address
//   NEXT_PUBLIC_SITE_URL       — deployed origin (see lib/seo.ts)

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@veyra.example";

export const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@veyra.example";

/** True when contact addresses are still the placeholder defaults. */
export const CONTACT_IS_PLACEHOLDER =
  !process.env.NEXT_PUBLIC_CONTACT_EMAIL || !process.env.NEXT_PUBLIC_PRIVACY_EMAIL;
