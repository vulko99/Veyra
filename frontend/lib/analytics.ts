// Vendor-neutral analytics event layer for the Veyra acquisition funnel.
//
// track() is always safe to call: it pushes a typed event to window.dataLayer
// and forwards to Google Analytics (gtag) or Plausible when either is present.
// With no provider configured it no-ops, so instrumentation can live in the
// code permanently and light up once an env var is set at deploy time.
//
// IMPORTANT: never pass personal or financial data here — no names, emails,
// phone numbers, amounts tied to a person, or public_id. Only funnel signals
// and coarse, non-identifying properties.
//
// CONSENT: track() drops every event until the visitor has granted analytics
// consent. Events are deliberately NOT queued for later replay — a user who
// has not consented should leave no measurement trail at all, and replaying a
// pre-consent buffer after a grant would defeat that.

import { hasAnalyticsConsent } from "@/lib/consent";

export type AnalyticsEvent =
  // Requested pre-launch funnel events
  | "page_view"
  | "calculator_started"
  | "calculator_completed"
  | "application_started"
  | "application_step_completed"
  | "application_completed"
  | "match_generated"
  | "multiple_matches_generated"
  | "partner_selected"
  | "referral_created"
  | "partner_clicked"
  // Additional existing signals (kept for continuity)
  | "landing_view"
  | "cta_click"
  | "consent_given"
  | "matching_completed"
  | "matches_shown"
  | "outbound_click"
  | "calculator_used";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  // Default-deny. No consent, no event — not even to window.dataLayer.
  if (!hasAnalyticsConsent()) return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props);
    }
    if (typeof window.plausible === "function") {
      window.plausible(event, { props });
    }
  } catch {
    // analytics must never break the app
  }
}
