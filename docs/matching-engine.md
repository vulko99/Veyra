# Matching engine

Location: `backend/apps/matching/`.

```python
from apps.matching.engine import match_application
result = match_application(application)
```

```json
{
  "application_id": "…",
  "matches": [
    {
      "lender_id": "…",
      "product_id": "…",
      "eligible": true,
      "score": 92,
      "rank": 1,
      "reasons": [
        "Requested amount fits the product range.",
        "Requested term fits the product range."
      ]
    }
  ]
}
```

> **The score is an internal compatibility score, not a credit score and not a
> probability of approval.** The engine never tells a consumer they have an "X%
> chance of approval". Customer-facing language is *"this option appears
> relevant based on the information you provided."*

## Pipeline

```
Application
  → normalise to a flat field context
  → for each active product of each active lender:
        built-in range checks (amount, term, income)
        + generic EligibilityRule evaluation
  → eligible products
  → score each (0–100, configurable weights)
  → rank by score, then lender priority
  → keep top N (MATCHING_TOP_N, default 3)
  → persist Match rows, return top N
```

Re-running is idempotent: prior `Match` rows for the application are replaced.

## Eligibility — data driven

There is **no lender-specific branching**. Beyond the built-in amount/term/
income range checks, eligibility is expressed as `EligibilityRule` rows:

| Part       | Meaning                                                      |
|------------|-------------------------------------------------------------|
| `field`    | `requested_amount`, `requested_term_months`, `monthly_income`, `employment_type`, `employment_months`, `existing_debt`, `monthly_debt_payment`, `loan_purpose` |
| `operator` | `EQUALS`, `NOT_EQUALS`, `GREATER_THAN[_OR_EQUAL]`, `LESS_THAN[_OR_EQUAL]`, `IN`, `NOT_IN`, `BETWEEN` |
| `value`    | JSON — scalar, list (`IN`/`NOT_IN`), or `[low, high]` (`BETWEEN`) |

Numeric comparisons coerce to `Decimal`; equality/membership fall back to
case-insensitive string comparison. Example:

```
field = requested_amount
operator = LESS_THAN_OR_EQUAL
value = 850
```

## Scoring — configurable

Default weights (sum to 100), overridable via `SCORING_WEIGHTS` in settings:

| Component             | Default weight |
|-----------------------|----------------|
| Amount compatibility  | 25             |
| Term compatibility    | 20             |
| Income compatibility  | 20             |
| Employment            | 20             |
| Product suitability   | 15             |

Range fit peaks when the request sits centrally within a product's range and
tapers toward the edges (never below half-marks while in range). Income fit
scales toward full marks at ~2× the product minimum. Employment and purpose
fit use small, transparent lookup tables.

## Reasons and confidentiality

Each reason is `{ "text": "...", "show_to_customer": bool }`. A rule's
`show_reason_to_customer` flag (and optional `reason_template`) controls whether
its reason is exposed. The API and results page only ever show
customer-cleared reasons, so confidential underwriting criteria are never
leaked.

## Configuration knobs

- `MATCHING_TOP_N` (env / settings) — number of matches returned (default 3).
- `SCORING_WEIGHTS` (settings) — per-component weights.
