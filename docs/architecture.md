# Architecture

Veyra is a **modular monolith**: one deployable Django backend composed of
focused apps, plus a Next.js frontend. This keeps the MVP simple to operate
while drawing clean seams so components can later be extracted into services if
scale requires it.

## High-level flow

```
Traffic ──► Next.js funnel ──► POST /applications (draft, consents)
                                     │
                                     ▼
                          POST /applications/{id}/submit
                                     │  (consents validated,
                                     │   financial profile snapshot)
                                     ▼
                          POST /applications/{id}/match
                                     │  (matching engine)
                                     ▼
                          GET  /applications/{id}/matches ──► Results page
                                     │
                     user clicks "Continue to partner"
                                     ▼
                          POST /applications/{id}/route ──► Lead + outbound URL
                                     │
                          partner runs its own process
                                     ▼
                          POST /webhooks/{lender_slug} ──► LeadEvent (immutable)
                                     │  approved / funded / cancelled
                                     ▼
                                 Commission
```

## Backend apps

| App            | Responsibility                                                    |
|----------------|-------------------------------------------------------------------|
| `core`         | Shared base models, security/hashing, logging, middleware, email, error envelope, health |
| `accounts`     | Custom UUID `User` (admin/staff; applicants need no account)       |
| `applications` | `Application` (central object) + separated `FinancialProfile`      |
| `consents`     | Explicit, versioned `Consent` records                             |
| `lenders`      | `Lender`, `LenderProduct`, generic `EligibilityRule`              |
| `matching`     | Data-driven engine + persisted `Match`                            |
| `leads`        | `Lead`, immutable `LeadEvent`, routing, webhook infrastructure    |
| `commissions`  | `Commission` calculation from product payout config              |
| `analytics`    | KPI aggregation (admin dashboard)                                |
| `audit`        | Append-only `AuditLog`                                            |

## Design principles

- **No lender-specific code.** Everything a lender's matching/commission
  behaviour depends on is configuration (product ranges, `EligibilityRule`
  rows, payout model/value). Adding a lender = adding data.
- **API-first.** The frontend is a pure client of `/api/v1/`.
- **Privacy by design.** UUID identifiers, hashed request fingerprints, no PII
  in logs, versioned consent, append-only audit, retention/anonymisation.
- **Consistent contracts.** One error envelope, one pagination style, one
  structured-logging format with request IDs.
- **Provider-agnostic integrations.** Email goes through an abstraction; error
  tracking (Sentry) and cloud infra are optional/pluggable.

## Asynchronous work

Celery + Redis are configured for background work (e.g. email dispatch,
future partner integrations). In development, tasks run eagerly unless a broker
is configured.

## Extraction seams (future)

Each app communicates through service functions and models, not cross-imports
of view internals. The matching engine, webhook ingestion, and commission
calculation are the most natural first candidates for extraction into separate
services should throughput demand it.
