import type {
  ApplicationDraft,
  ConsentFlags,
  Phase2Application,
  Phase2MatchResponse,
  ReferralResponse,
} from "@/types";
import { track } from "@/lib/analytics";

// Phase 1 base (/api/v1); Phase 2 lives at /api.
const V1 = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API = V1.replace(/\/v1\/?$/, ""); // -> "/api" or "http://localhost:8000/api"

export class ApiRequestError extends Error {
  code: string;
  details: Record<string, unknown>;
  status: number;
  constructor(
    code: string,
    message: string,
    details: Record<string, unknown>,
    status = 0
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!res.ok) {
    const err = body as { error?: { code: string; message: string; details: Record<string, unknown> } };
    if (err?.error)
      throw new ApiRequestError(err.error.code, err.error.message, err.error.details || {}, res.status);
    throw new ApiRequestError("REQUEST_FAILED", `Request failed (${res.status}).`, {}, res.status);
  }
  return body as T;
}

/** Map the local funnel draft to the Phase 2 application payload. */
export function draftToPayload(
  draft: ApplicationDraft,
  currentStep?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (currentStep) payload.current_step = currentStep;
  if (draft.requested_amount) payload.desired_amount_eur = draft.requested_amount;
  if (draft.requested_term_months != null)
    payload.desired_term_months = draft.requested_term_months;

  // Attribution
  for (const k of [
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referrer",
    "landing_page",
  ] as const) {
    if (draft[k]) payload[k] = draft[k];
  }

  // Applicant
  if (draft.full_name) {
    const parts = draft.full_name.trim().split(/\s+/);
    payload.first_name = parts[0] || "";
    payload.last_name = parts.slice(1).join(" ");
  }
  if (draft.email) payload.email = draft.email;
  if (draft.phone) payload.phone = draft.phone;
  if (draft.monthly_income) payload.monthly_income_eur = draft.monthly_income;
  if (draft.employment_type) payload.employment_status = draft.employment_type;
  if (draft.has_existing_loans !== undefined) {
    payload.existing_monthly_obligations_eur = draft.has_existing_loans
      ? draft.existing_monthly_payments || "0"
      : "0";
  }
  return payload;
}

export function createApplication(
  payload: Record<string, unknown>
): Promise<Phase2Application> {
  return request<Phase2Application>("/applications/", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((app) => {
    track("application_started");
    return app;
  });
}

export function patchApplication(
  publicId: string,
  payload: Record<string, unknown>
): Promise<Phase2Application> {
  return request<Phase2Application>(`/applications/${publicId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((app) => {
    const step = typeof payload.current_step === "string" ? payload.current_step : undefined;
    track("application_step_completed", step ? { step } : {});
    return app;
  });
}

export function getApplication(publicId: string): Promise<Phase2Application> {
  return request(`/applications/${publicId}/`);
}

export function postConsent(
  publicId: string,
  flags: ConsentFlags
): Promise<Phase2Application> {
  return request<Phase2Application>(`/applications/${publicId}/consent/`, {
    method: "POST",
    body: JSON.stringify(flags),
  }).then((app) => {
    track("consent_given");
    return app;
  });
}

export function runMatch(publicId: string): Promise<Phase2MatchResponse> {
  return request<Phase2MatchResponse>(`/applications/${publicId}/match/`, {
    method: "POST",
    body: JSON.stringify({}),
  }).then((res) => {
    track("application_completed");
    track("matching_completed", { count: res.matches?.length ?? 0 });
    return res;
  });
}

export function getMatches(publicId: string): Promise<Phase2MatchResponse> {
  return request(`/applications/${publicId}/matches/`);
}

export function selectPartner(
  publicId: string,
  productId: string
): Promise<ReferralResponse> {
  return request<ReferralResponse>(`/applications/${publicId}/select-partner/`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  }).then((res) => {
    track("referral_created");
    return res;
  });
}
