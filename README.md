# Veyra

**Veyra is a Bulgarian digital financial marketplace.** It connects consumers
looking for short-term / consumer credit with relevant lending partners through
a single, simple application.

> **Veyra is not a lender.** Veyra does **not** lend money, does **not** make
> final credit decisions, and does **not** guarantee approval. The business
> model is performance-based customer acquisition: traffic → application →
> consent → eligibility/matching → partner → approval/funding → commission.

This repository is a **modular monolith** MVP: a Django/DRF backend and a
Next.js frontend, orchestrated with Docker Compose. The architecture is
designed so additional lenders and financial products can be added through
configuration — never by editing application code.

---

## Contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Quick start (Docker)](#quick-start-docker)
- [Local development (without Docker)](#local-development-without-docker)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [The matching engine](#the-matching-engine)
- [Webhooks](#webhooks)
- [Admin dashboard](#admin-dashboard)
- [Testing](#testing)
- [Security & privacy](#security--privacy)
- [Deployment](#deployment)
- [Regulatory note](#regulatory-note)

---

## Architecture

```
Traffic
  → Veyra application (Next.js funnel)
  → Consent (explicit, versioned)
  → Eligibility / matching (data-driven rules engine)
  → Relevant lender partner(s)
  → Partner application (outbound, tracked)
  → Approved / Funded (partner webhooks)
  → Commission
```

- **Backend:** Python 3.12 · Django 5 · Django REST Framework · PostgreSQL ·
  Celery · Redis
- **Frontend:** Next.js (App Router) · TypeScript · Tailwind CSS · mobile-first
- **Infra:** Docker Compose for dev; cloud-agnostic for production (AWS,
  Railway, Render, …) via `DATABASE_URL` / `REDIS_URL`.

See [`docs/architecture.md`](docs/architecture.md),
[`docs/database.md`](docs/database.md),
[`docs/api.md`](docs/api.md), and
[`docs/matching-engine.md`](docs/matching-engine.md).

## Repository layout

```
veyra/
├── backend/            Django project (config/) + apps/
│   ├── config/         settings (base/development/production), urls, celery, wsgi
│   ├── apps/           accounts, applications, consents, lenders, matching,
│   │                   leads, commissions, analytics, audit, core
│   ├── requirements/   base / development / production
│   └── tests/          pytest suite (unit + API)
├── frontend/           Next.js app (app/, components/, lib/, hooks/, types/)
├── docs/               architecture, api, database, matching-engine
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick start (Docker)

Prerequisites: Docker + Docker Compose.

```bash
cp .env.example .env          # adjust values as needed
docker compose up --build
```

This starts:

| Service    | URL                              | Notes                          |
|------------|----------------------------------|--------------------------------|
| `backend`  | http://localhost:8000            | migrates + seeds demo data     |
| `frontend` | http://localhost:3000            | the consumer funnel            |
| `db`       | localhost:5432                   | PostgreSQL 16                  |
| `redis`    | localhost:6379                   | Celery broker/result backend   |
| `celery`   | —                                | background worker              |

The backend container runs migrations and (because `SEED_DEMO_DATA=true` in
compose) seeds three **demo** lenders on start.

Create an admin user:

```bash
docker compose exec backend python manage.py createsuperuser
```

Then visit the Django admin at http://localhost:8000/admin/.

## Run in the browser (GitHub Codespaces)

No local setup or editor required:

1. On GitHub, open the repo and select this branch.
2. Click **Code → Codespaces → Create codespace on this branch**.
3. Wait for the one-time setup (installs deps, migrates, seeds demo data), then
   the servers start automatically. Open the forwarded **port 3000** from the
   **Ports** tab (a preview usually pops up on its own).

The devcontainer (`.devcontainer/`) runs Django (SQLite, eager Celery — no extra
containers) and Next.js, and the frontend proxies `/api/*` to the backend so the
browser only ever uses one forwarded origin (avoids cross-origin/port-auth
issues). Admin: forwarded **port 8000** `/admin` — `admin@veyra.example` /
`veyra-demo-pass`. Re-run `bash .devcontainer/start.sh` if you need to restart
the servers.

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt

# Uses SQLite by default if DATABASE_URL is unset (fine for local/testing).
python manage.py migrate
python manage.py seed_demo_data
python manage.py createsuperuser
python manage.py runserver
```

API: http://localhost:8000/api/v1/ · Health: http://localhost:8000/health/

### Frontend

```bash
cd frontend
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm install
npm run dev
```

App: http://localhost:3000

## Environment variables

All configuration comes from the environment; **no secrets are committed**.
See [`.env.example`](.env.example) for the full list. Highlights:

- `DJANGO_SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DATABASE_URL`, `REDIS_URL`
- `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- `NEXT_PUBLIC_API_URL` (frontend)
- `HASH_SALT` (salts PII hashing — rotate with care)
- `MATCHING_TOP_N`, `PRIVACY_POLICY_VERSION`, `TERMS_VERSION`, `DATA_RETENTION_DAYS`
- Partner credentials are **separate**, one set per lender, e.g.
  `LENDER_DEMO_LENDER_A_WEBHOOK_SECRET`.

## API overview

Base path: `/api/v1/`. Full reference in [`docs/api.md`](docs/api.md).

| Method & path                               | Auth   | Purpose                        |
|---------------------------------------------|--------|--------------------------------|
| `POST /applications/`                       | public | create an application          |
| `GET  /applications/{id}/`                  | public | fetch by UUID                  |
| `POST /applications/{id}/submit/`           | public | validate consents & submit     |
| `POST /applications/{id}/match/`            | public | run/refresh matching           |
| `GET  /applications/{id}/matches/`          | public | fetch top matches              |
| `POST /applications/{id}/route/`            | public | click-through → create lead    |
| `GET  /lenders/`, `GET /lenders/{id}/`      | public | active lenders + products      |
| `GET  /leads/`, `GET /leads/{id}/`          | admin  | lead inspection                |
| `POST /lenders/`, `PATCH /lenders/{id}/`    | admin  | manage lenders                 |
| `POST /lender-products/` …                  | admin  | manage products                |
| `POST /eligibility-rules/` …                | admin  | manage rules                   |
| `GET  /analytics/kpis/`                     | admin  | conversion KPIs                |
| `POST /webhooks/{lender_slug}/`             | HMAC   | partner conversion callbacks   |
| `GET  /health/`                             | public | health probe                   |

All errors use a consistent envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid data.", "details": {} } }
```

## The matching engine

Located in `backend/apps/matching/`. Exposes `match_application(application)`
returning ranked, scored matches with human-readable reasons. Eligibility is
**data-driven**: product amount/term/income ranges plus generic
`EligibilityRule` rows (`field` / `operator` / `value`). Scoring weights are
configurable. **The score is a compatibility score, not a credit score and not
a probability of approval.** See
[`docs/matching-engine.md`](docs/matching-engine.md).

## Webhooks

`POST /api/v1/webhooks/{lender_slug}/` accepts partner conversion events.
Handling supports **HMAC-SHA256 signature validation** (per-lender secret from
the environment), **idempotency** (`event_id` de-duplication), an **immutable
event log** (`LeadEvent`), and status/commission side-effects. Unknown lenders
→ 404, invalid signatures → 401, unknown event types → 422.

## Admin dashboard

Django Admin provides management and inspection views for Applications,
Lenders, Products, Eligibility rules, Matches, Leads, Commissions, Consents,
and the append-only Audit log (read-only in the UI).

## Testing

```bash
cd backend
source .venv/bin/activate
pytest                       # run the suite
pytest --cov=apps            # with coverage (target: 80%+, currently ~88%)
```

Covers applications, consents, matching, leads, webhooks, commissions,
security (auth, ID enumeration, PII-safe logging), analytics, and health.

Frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

## Internationalization (Bulgarian-first)

The frontend is **Bulgarian-first** and structured for i18n from day one.
All customer-facing text — pages, the application wizard, validation, consent,
results, FAQ, and legal placeholders — comes from typed message catalogs in
`frontend/i18n/dictionaries/` (`bg.ts` is the default and source of truth;
`en.ts` is fully prepared and type-checked against the same shape). Components
read the active catalog via `useMessages()` / `useI18n()`
(`frontend/hooks/useI18n.tsx`); the active locale persists per visitor and can
be switched to `en` in future without touching components.

The matching engine stays language-neutral: it emits stable **reason codes**
(e.g. `amount_in_range`) with parameters, which the frontend localizes — so the
API is not tied to any language and the English fallback keeps backend tests
stable. Customer-facing emails are Bulgarian.

### URL strategy

Public URLs use **Latin transliteration of Bulgarian**, not Cyrillic:

    /kalkulator                  not   /калкулатор
    /kak-podrezhdame-ofertite    not   /как-подреждаме-офертите

Both work — Cyrillic URLs are percent-encoded in transit and display correctly
in the browser — but transliteration is the safer default for tooling
compatibility (analytics, ad platforms, logs, CI, spreadsheets, and anything
that mangles percent-encoded UTF-8).

**This is decided; apply it consistently.** New routes get transliterated
slugs. Existing examples: `/krediti`, `/barzi-krediti`, `/kalkulator`,
`/kredit-do-zaplata`, `/obedinyavane-na-zadalzheniya`.

## Compliance surfaces you must not regress

The Bulgarian Consumer Credit Act transposing EU Directive 2023/2225 takes
effect **20 November 2026**. Several behaviours in this codebase exist to
satisfy it (and the Google Ads financial-products policy), and are easy to undo
by accident:

- **No speed or ease claims about obtaining credit**, in any language,
  anywhere — including `alt` text, meta descriptions and OG tags. The law
  targets emphasising *лекотата или бързината* of getting credit. Describing
  the product honestly ("one request instead of many") is fine; promising fast
  money is not.
- **The credit warning** (`<CreditWarning>`) renders at body type size in the
  page flow. Not the footer, not behind a click, never shrunk to fine print.
  Its wording lives in `frontend/config/legal.ts`, never inline.
- **The disclosures block** (`<LegalDisclosures>`) must stay visible without
  clicking, hovering or expanding. ЗПК чл. 25 requires the representative
  example to be no less prominent than the surrounding copy.
- **The ГПР cap moves.** It resets every 1 January and 1 July — `APR_CAP` in
  `frontend/config/legal.ts`. Never hardcode it.
- **The ranking methodology** at `/kak-podrezhdame-ofertite` describes what
  `apps/matching/scoring.py` actually does, including the commercially
  motivated tie-break. Changing the weights without updating that page makes a
  published disclosure inaccurate.
- **No consent checkbox is pre-ticked**, and analytics loads nothing before
  consent (`frontend/lib/consent.ts`).
- **No `Review` / `AggregateRating` structured data** without genuine,
  verifiable reviews.
- **Nothing regulated is invented.** Unsupplied values stay loud `[[TODO:*]]`
  placeholders — see [`TODO-LEGAL.md`](TODO-LEGAL.md).

## Security & privacy

- UUID public references — sequential DB IDs are never exposed.
- PII minimisation: IP/User-Agent stored only as salted SHA-256 hashes.
- No sensitive data in logs (structured JSON logging + masking helpers).
- Explicit, **versioned** consent; marketing consent always separate/optional.
- Append-only audit trail; GDPR retention via `anonymize_expired` command.
- CSRF, CORS restrictions, secure-cookie/HTTPS-ready production settings,
  rate limiting, ORM parameterization, security headers, admin permission checks.

## Deployment

Cloud-agnostic. Provide `DATABASE_URL` and `REDIS_URL`, set
`DJANGO_SETTINGS_MODULE=config.settings.production`, a strong
`DJANGO_SECRET_KEY`, and `ALLOWED_HOSTS`. The backend image runs migrations via
`entrypoint.sh` and serves through gunicorn. Static files: `collectstatic`.
Run Celery as a separate worker process.

## Regulatory note

This application handles financial information and may operate in a regulated
financial-intermediation environment. **The MVP architecture does not by itself
establish legal compliance.** Before production launch, obtain Bulgarian
legal/regulatory advice and finalise licensing, GDPR/data-processing structure,
partner agreements, required disclosures, and advertising rules. The code keeps
consent, partner disclosures, terms/privacy versions, and audit records
configurable to support this.

Outstanding values the owner must supply before launch — company identity,
disclosures, representative example, partner list, confirmed statutory warning
wording and target domain — are collected in
[`TODO-LEGAL.md`](TODO-LEGAL.md).
