# API reference

Base path: `/api/v1/`. JSON in/out. Public endpoints require no authentication;
admin endpoints require a staff session; webhooks use HMAC signatures.

## Error envelope

Every error response has the shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid data.", "details": {} } }
```

Common codes: `VALIDATION_ERROR`, `NOT_AUTHENTICATED`, `PERMISSION_DENIED`,
`NOT_FOUND`, `RATE_LIMITED`, `CONSENT_REQUIRED`, `INVALID_SIGNATURE`,
`UNKNOWN_LENDER`, `LEAD_NOT_FOUND`, `UNKNOWN_EVENT_TYPE`, `INTERNAL_ERROR`.

## Applications

### `POST /applications/`
Create an application (status `STARTED`). Body accepts the writable application
fields plus an optional `consents` array.

```json
{
  "requested_amount": "3000",
  "requested_term_months": 24,
  "monthly_income": "2500",
  "employment_type": "FULL_TIME",
  "email": "you@example.com",
  "consents": [
    {"consent_type": "PLATFORM_PROCESSING", "accepted": true},
    {"consent_type": "PARTNER_DATA_TRANSFER", "accepted": true},
    {"consent_type": "MARKETING", "accepted": false}
  ]
}
```

`201` → the application read object (includes `id`, `public_reference`,
`status`, `consents`).

### `GET /applications/{id}/`
Fetch by UUID. `404` if not found.

### `POST /applications/{id}/submit/`
Validates required consents (inline `consents` accepted), snapshots the
financial profile, sets status `SUBMITTED`, sends a confirmation email if an
address is present. `400 CONSENT_REQUIRED` (with `details.missing`) if a
required consent is absent. Rate-limited.

## Matching

### `POST /applications/{id}/match/`
Runs the engine, persists `Match` rows, advances status to `MATCHED`.
Returns `{ "application_id", "matches": [...] }`.

### `GET /applications/{id}/matches/`
Returns the current top matches (rank-ordered). Each match exposes lender/
product names, amount/term ranges, `eligible`, `score`, `rank`, and
customer-safe `reasons`.

## Routing (public click-through)

### `POST /applications/{id}/route/`
Body `{ "product_id": "<uuid>" }`. Creates (or returns) the lead, records a
`CLICK` event, and returns `{ "lead_id", "tracking_id", "outbound_url" }`. The
frontend redirects the user to `outbound_url`.

## Lenders (public read / admin write)

- `GET /lenders/` — active lenders with active products.
- `GET /lenders/{id}/`
- `POST /lenders/`, `PATCH /lenders/{id}/` — admin.
- `POST /lender-products/`, `PATCH /lender-products/{id}/` — admin.
- `POST /eligibility-rules/`, `PATCH /eligibility-rules/{id}/` — admin.

## Leads (admin)

- `GET /leads/` — filterable by `status`, `lender`, `product`.
- `GET /leads/{id}/` — includes the event log.
- `POST /leads/{id}/route/` — returns the outbound URL for a lead.

## Analytics (admin)

### `GET /analytics/kpis/`
Optional filters: `date_from`, `date_to`, `lender`, `product`, `source`,
`campaign`. Returns applications, qualified, matches, leads_routed, approved,
funded, revenue, and derived rates (conversion, approval, funded, revenue per
application / per funded customer).

## Webhooks

### `POST /webhooks/{lender_slug}/`
Partner conversion callback. See [`matching-engine.md`](matching-engine.md) and
the README's webhook section. Supports HMAC-SHA256 signature validation
(`X-Signature: sha256=...`), idempotency via `event_id`, and returns
`{ "received", "duplicate", "lead_id", "lead_status" }`.

Recognised `event_type` values map to lead events: `click`, `redirect`,
`started`/`application_started`, `completed`/`application_completed`,
`approved`, `declined`/`rejected`, `funded`/`paid`, `cancelled`.

## Health

### `GET /health/`
`{ "status": "ok" }` (200) when the database is reachable; `503` otherwise.
