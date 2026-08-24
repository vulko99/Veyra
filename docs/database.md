# Database model

All primary keys are UUIDs unless noted. `created_at` / `updated_at` are
present on most tables. Personally identifying request metadata (IP, User-Agent)
is stored only as salted SHA-256 hashes.

## Application (`applications_application`)

The central business object. Key fields: `public_reference` (unguessable,
non-sequential), request (`requested_amount`, `requested_currency`,
`requested_term_months`), financial snapshot (`monthly_income`,
`employment_type`, `employment_months`, `has_existing_loans`,
`existing_loan_balance`, `existing_monthly_payments`), `purpose`, minimal
demographics (`city`, `age_range`), contact (`email`, `phone`), `status`, and
tracking (`source`, `campaign`, `utm_*`, `referrer`, `landing_page`),
`ip_hash`, `user_agent_hash`.

**Status:** `DRAFT → STARTED → SUBMITTED → QUALIFIED → MATCHED → ROUTED →
IN_PROGRESS → APPROVED → FUNDED`, plus `DECLINED`, `EXPIRED`, `CANCELLED`.

### FinancialProfile (`applications_financialprofile`)

One-to-one with Application. A normalised copy of the most sensitive financial
fields, written at submission — supports targeted retention/anonymisation.

## Consent (`consents_consent`)

`application`, `consent_type` (`PLATFORM_PROCESSING`, `PARTNER_DATA_TRANSFER`,
`MARKETING`), `consent_text_version`, `accepted`, `accepted_at`,
`privacy_policy_version`, `terms_version`, `ip_hash`, `user_agent_hash`.
Unique per (application, consent_type). `PLATFORM_PROCESSING` and
`PARTNER_DATA_TRANSFER` are required to submit; `MARKETING` is optional.

## Lender (`lenders_lender`)

`name`, `slug` (unique), `description`, `logo`, `website_url`, `active`,
`priority` (ranking tie-breaker).

## LenderProduct (`lenders_lenderproduct`)

`lender`, `name`, `slug` (unique per lender), `product_type`
(`SHORT_TERM_LOAN`, `CONSUMER_LOAN`, `REFINANCING`, `DEBT_CONSOLIDATION`,
`CREDIT_CARD`, `OTHER`), `min_amount`/`max_amount`, `currency`,
`min_term_months`/`max_term_months`, `min_income`, `application_url`,
`tracking_type`, `tracking_url_template`, `affiliate_id`, `payout_model`
(`CPL`, `CPA`, `CPS`, `CPS_PERCENT`, `HYBRID`), `payout_value`, `active`.

## EligibilityRule (`lenders_eligibilityrule`)

Generic condition attached to a product: `field` (one of `requested_amount`,
`requested_term_months`, `monthly_income`, `employment_type`,
`employment_months`, `existing_debt`, `monthly_debt_payment`, `loan_purpose`),
`operator` (`EQUALS`, `NOT_EQUALS`, `GREATER_THAN[_OR_EQUAL]`,
`LESS_THAN[_OR_EQUAL]`, `IN`, `NOT_IN`, `BETWEEN`), `value` (JSON:
scalar / list / `[low, high]`), `show_reason_to_customer`, `reason_template`,
`active`.

## Match (`matching_match`)

`application`, `lender`, `product`, `eligible`, `score` (0–100 compatibility),
`rank`, `reasons` (JSON list of `{text, show_to_customer}`). Unique per
(application, product).

## Lead (`leads_lead`)

`application`, `lender`, `product`, `status` (`CREATED`, `SENT`, `CLICKED`,
`APPLICATION_STARTED`, `APPLICATION_COMPLETED`, `APPROVED`, `FUNDED`,
`DECLINED`, `REJECTED`, `EXPIRED`), `external_lead_id`,
`external_application_id`, `tracking_id` (unique), `click_id`, `affiliate_id`,
`sent_at`. Unique per (application, product).

## LeadEvent (`leads_leadevent`)

Immutable log: `lead`, `event_type` (`CLICK`, `REDIRECT`,
`APPLICATION_STARTED`, `APPLICATION_COMPLETED`, `APPROVED`, `DECLINED`,
`FUNDED`, `CANCELLED`), `timestamp`, `external_event_id`, `metadata`.
Unique per (lead, external_event_id) → idempotency.

## Commission (`commissions_commission`)

One-to-one with Lead: `lender`, `payout_model`, `expected_amount`,
`actual_amount`, `currency`, `status` (`PENDING`, `CONFIRMED`, `REJECTED`,
`CLAWBACK`, `PAID`), `confirmed_at`, `paid_at`. Payout is computed from the
product configuration, never hard-coded.

## AuditLog (`audit_auditlog`)

Append-only: `actor` (nullable user), `actor_label`, `action`, `entity_type`,
`entity_id`, `timestamp`, `ip_hash`, `metadata`.
