// ---------------------------------------------------------------------------
// Cookie / analytics consent state.
//
// This is a real gate, not a banner. Nothing non-essential may run before the
// user has actively chosen:
//
//   * <Analytics> does not render any provider <Script> until consent is
//     granted, so no third-party JS is fetched at all;
//   * track() in lib/analytics.ts drops events until consent is granted.
//
// Consequences that are deliberate:
//   - The default is DENIED. Absence of a choice is not consent.
//   - Rejecting is exactly as easy as accepting (one click, same prominence).
//   - The stored decision carries a version, so changing what we ask for
//     re-prompts instead of silently inheriting an old answer.
// ---------------------------------------------------------------------------

export const CONSENT_STORAGE_KEY = "veyra_cookie_consent";

/**
 * Bump when the categories or the wording materially change — a stored
 * decision with a different version is treated as "not asked yet".
 */
export const CONSENT_VERSION = "2026-09-01";

export type ConsentState = {
  /** Analytics / measurement cookies. */
  analytics: boolean;
  version: string;
  /** ISO timestamp of the decision, for the audit trail. */
  decidedAt: string;
};

const EVENT = "veyra:consent-change";

/** The stored decision, or null when the user has not chosen yet. */
export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    // A decision recorded against older wording is not a decision about this
    // wording — ask again rather than assuming.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    return parsed as ConsentState;
  } catch {
    // Private mode, blocked storage, corrupt value: treat as "not asked".
    return null;
  }
}

/** Default-deny: only an explicit, current grant counts. */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

export function setConsent(analytics: boolean): void {
  if (typeof window === "undefined") return;
  const state: ConsentState = {
    analytics,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — the in-memory notification below still lets the
    // current page respond; the user will simply be asked again next visit.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

/** Subscribe to consent changes (same tab and across tabs). */
export function subscribeConsent(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) fn();
  };
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
}
