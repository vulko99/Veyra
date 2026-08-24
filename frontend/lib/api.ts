import type {
  ApplicationDraft,
  ApplicationResponse,
  ConsentInput,
  MatchResponse,
} from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiRequestError extends Error {
  code: string;
  details: Record<string, unknown>;
  constructor(code: string, message: string, details: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const err = body as { error?: { code: string; message: string; details: Record<string, unknown> } };
    if (err?.error) {
      throw new ApiRequestError(err.error.code, err.error.message, err.error.details || {});
    }
    throw new ApiRequestError("REQUEST_FAILED", `Request failed (${res.status}).`, {});
  }
  return body as T;
}

export function createApplication(
  draft: ApplicationDraft,
  consents: ConsentInput[]
): Promise<ApplicationResponse> {
  return request<ApplicationResponse>("/applications/", {
    method: "POST",
    body: JSON.stringify({ ...draft, consents }),
  });
}

export function submitApplication(id: string): Promise<ApplicationResponse> {
  return request<ApplicationResponse>(`/applications/${id}/submit/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function runMatching(id: string): Promise<MatchResponse> {
  return request<MatchResponse>(`/applications/${id}/match/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getMatches(id: string): Promise<MatchResponse> {
  return request<MatchResponse>(`/applications/${id}/matches/`);
}

export function routeToPartner(
  applicationId: string,
  productId: string
): Promise<{ lead_id: string; tracking_id: string; outbound_url: string }> {
  return request(`/applications/${applicationId}/route/`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}
