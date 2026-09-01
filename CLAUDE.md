# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Veyra is a Bulgarian **financial marketplace** (Django/DRF + Next.js modular monolith) that
matches consumers to lending partners. **Veyra is not a lender** — it never approves credit and
never states a probability of approval. The match score is a *compatibility score* against a
partner's **published criteria**. Customer-facing copy must never imply approval; the backend
already enforces this phrasing (`_reason_summary` in `apps/matching/engine.py`).

Business flow: traffic → application → consent → matching → partner referral → partner webhook →
commission.

## Commands

Docker (full stack: Postgres, Redis, Django, Celery, Next):

```bash
cp .env.example .env && docker compose up --build
```

Backend (local, SQLite when `DATABASE_URL` is unset):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py seed_demo_data     # 3 fictional demo partners
python manage.py runserver
```

Tests and lint (run from `backend/`; `pytest.ini` pins `config.settings.development`):

```bash
pytest                                   # whole suite
pytest tests/test_matching.py            # one file
pytest tests/test_matching.py::test_name # one test
pytest -k "webhook and hmac"             # by expression
pytest --cov=apps                        # coverage (~88%)
ruff check .                             # lint (config in backend/ruff.toml)
```

Frontend (from `frontend/`): `npm run dev` · `npm run typecheck` · `npm run build` · `npm run lint`.
There is no frontend test runner — `typecheck` + `build` is the gate.

Other management commands: `seed_demo_data`, `seed_vivacredit`, `anonymize_expired` (GDPR retention).

Note: the default branch is `claude/veyra-mvp-spec-ujb2ba`, not `main`.

## Two API generations coexist

`config/urls.py` mounts three route groups. This is the single most important thing to know
before adding an endpoint:

| Mount | Generation | Identifier | Consumed by |
|---|---|---|---|
| `/api/v1/` (`config/api_urls.py`) | Phase 1 | `Application.id` UUID | admin API, legacy; still tested |
| `/api/` (`apps/applications/phase2_urls.py`) | Phase 2 | `public_id` — `VY-XXXXXX` | **the Next.js funnel** |
| `/api/` (`apps/lenders/phase3_urls.py`) | Phase 3 | Lender UUID | public read-only partner catalogue |

Phase 2/3 code lives in files literally named `phase2_*.py` / `phase3_*.py` (views, serializers,
urls) plus `apps/matching/phase2.py`. Phase 2 is EUR-denominated, saves per wizard step, and
splits applicant PII into a separate `Applicant` record. Phase 3 is deliberately a thin read-only
alias over the same `Lender`/`LenderProduct` models — do not duplicate domain logic into it.

`frontend/lib/api.ts` derives the Phase 2 base by stripping `/v1` off `NEXT_PUBLIC_API_URL`.

## Matching engine — the core invariant

`apps/matching/` (`engine.py` evaluation, `rules.py` operators, `scoring.py` weights,
`phase2.py` the Phase 2 service wrapper).

- **No lender-specific code paths, ever.** Adding a partner is adding data: a `Lender`, its
  `LenderProduct` ranges, and generic `EligibilityRule` rows (`field`/`operator`/`value`).
  If you find yourself writing `if lender.slug == ...`, model it as configuration instead.
- Evaluation is **three-state**: `PASS` / `FAIL` / `UNKNOWN`. `UNKNOWN` means the applicant did
  not supply the field and only rejects the product when the rule is `mandatory`. Keep this
  distinction — collapsing UNKNOWN into FAIL silently rejects people for missing data.
- Reasons are emitted as **stable language-neutral codes** (`amount_in_range`, `income_below_min`,
  `rule_fail`, …) plus params and an English fallback string. The frontend localizes them in
  `frontend/i18n/dictionaries/{bg,en}.ts`. **A new reason code must be added to both dictionaries.**
- `MATCH_THRESHOLD` (env, default 80) gates referral eligibility; a partner may override via
  `minimum_match_score`. Never hard-code a threshold elsewhere.
- `match_application` is idempotent: it deletes prior `Match` rows for the application and
  re-creates them.

## Domain rules that are easy to break

- **Never expose database primary keys.** Public references come from `apps/core/reference.py`
  (`VY-…` application ids, `VEY-…`, opaque `tracking_id`). ID-enumeration is covered by
  `tests/test_security.py`.
- **Consent gates matching.** `has_required_consents()` must pass before Phase 2 matching runs;
  consents are versioned against `PRIVACY_POLICY_VERSION` / `TERMS_VERSION`, and marketing consent
  is always separate and optional.
- **DRF defaults to `IsAuthenticated`.** Public funnel endpoints must explicitly set `AllowAny`.
- **All errors use one envelope**: `{"error": {"code", "message", "details"}}`. Raise
  `VeyraAPIError(code=..., message=..., http_status=...)` from views/services; the handler is
  `apps.core.exceptions.veyra_exception_handler`. Never let a stack trace reach a client.
- **PII discipline.** IP and User-Agent are stored only as `HASH_SALT`-salted SHA-256 hashes.
  Logging is structured JSON with request IDs and masking helpers (`apps/core/logging.py`) — no PII
  in log lines. `apps/audit/` is append-only and read-only in the admin.
- **Referral payloads are allow-listed.** `apps/leads/delivery.py` sends only permitted fields —
  no DB ids, no compatibility score, no rule internals, no hashes. Partner-specific delivery is a
  pluggable backend selected by `Lender.delivery_method`; add a backend rather than a branch.
- **Webhook secrets** are read from `LENDER_<SLUG>_WEBHOOK_SECRET` (slug upper-cased, `-`→`_`).
  If no secret is configured, HMAC validation is *skipped* — an MVP convenience that must be
  closed before onboarding a real partner. Ingestion is idempotent on `event_id`, and `LeadEvent`
  is the immutable log.
- **`DEMO_MODE`** (default on) lets fictional demo partners participate in matching and simulates
  referrals to them — no email, no external call. Must be off in production.

## Frontend

Next.js 14 App Router, TypeScript, Tailwind. **Bulgarian-first**: every customer-facing string
comes from `frontend/i18n/dictionaries/bg.ts` (source of truth); `en.ts` is type-checked against
the same shape. Components read via `useMessages()` / `useI18n()` — never hard-code copy in a
component.

The funnel is `frontend/app/apply/*` driven by the ordered step list in `frontend/lib/wizard.ts`
(amount → term → income → employment → debt → contact → consent → results). Draft state lives in
`sessionStorage` via `hooks/useApplication.tsx`, which lazily creates the backend application
(`ensureApplication()`) and can recover from a 404 after a DB reset with `clearRemote()`.

Bulgarian SEO landing pages live at top-level slugs (`/krediti`, `/kredit-online`,
`/kredit-do-zaplata`, `/barzi-krediti`, …) with content in `lib/landing-content.ts` and
`lib/guides-content.ts`.

**Trailing slashes matter.** Django requires them; `next.config.mjs` sets
`skipTrailingSlashRedirect` and re-adds the slash in the `/api/*` rewrite. When `API_PROXY_TARGET`
is set (Codespaces, Render, Netlify) the browser talks only to the Next origin and the Next server
proxies to Django; otherwise the browser calls the backend directly via `NEXT_PUBLIC_API_URL`.
`NEXT_PUBLIC_API_URL` is baked at build time.

## Regulatory context

This handles financial data in a regulated Bulgarian intermediation context. Consent text,
partner disclosures, document versions, and audit records are deliberately configuration, not
code. Do not add copy that claims approval, guarantees, credit scoring, or a lending relationship.

## Phase 2 payload gotchas

Verified against a running server — these are easy to get wrong:

- The Phase 2 serializer exposes the `VY-XXXXXX` reference as **`id`**, not `public_id`, even though
  the URL kwarg is `public_id`.
- Phase 1 `EmploymentType` is **upper-case** (`FULL_TIME`, `SELF_EMPLOYED`); Phase 2
  `EmploymentStatus` is **lower-case** (`employed`, `self_employed`, `business_owner`, `pensioner`,
  `other`). They are different enums on different generations — don't cross them.
- The consent endpoint expects `privacy_processing_consent`, `partner_data_sharing_consent`,
  `marketing_consent` — not the short names used elsewhere in the UI.
- Matching before consent correctly returns `400 CONSENT_REQUIRED`; that is the gate working, not a bug.
- `home.viz.*` in the i18n dictionaries is **decorative marketing copy** (a fixed
  "€2 000 · 12 месеца" illustration), not application data. Never render it where a real applicant
  value is implied.
