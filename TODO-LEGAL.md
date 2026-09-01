# TODO — legal & regulatory values outstanding

**Every item below is a value that must come from the owner.** None of it may be
invented, estimated, or filled with a plausible-looking number: this is a
financial services site, and fabricated figures create legal exposure and
mislead borrowers.

Each row maps to a loud `[[TODO:*]]` placeholder in the codebase. The site
renders those placeholders visibly (not silently blank), so an unfilled value
fails in review rather than shipping quietly.

**Hard deadline: 20 November 2026** for everything marked `[LEGAL-DEADLINE]` —
the date Bulgaria's new Consumer Credit Act (transposing EU Directive
2023/2225) takes effect.

---

## How to fill these in

Most values are supplied as environment variables at deploy time; a few live in
config files. The "Where" column gives the exact location.

Check progress at any time:

```bash
cd frontend && npm run check:legal
```

### Pre-launch mode

While `NEXT_PUBLIC_PRELAUNCH` is unset or `true` (the default), `/apply` and
`/results` are closed and every primary CTA points at the calculator. The rest
of the site — calculator, guides, loan-purpose pages, legal pages — stays fully
live and indexable, so the SEO clock runs while the items below are gathered.

This exists because the funnel collects a name, phone, email and income, and
the consent text names Veyra as the data controller. **Until a registered
entity exists to be that controller, the funnel must not take real
submissions.** The default is ON so that forgetting a variable cannot result in
collecting personal data on behalf of a company that does not exist.

Set `NEXT_PUBLIC_PRELAUNCH=false` only when all of these hold:

1. the company is registered and §1 below is supplied;
2. at least one partner is signed and published in `config/partners.ts`;
3. the disclosures in §2 are filled in;
4. `NEXT_PUBLIC_API_URL` points at the real backend — otherwise the funnel
   collects a phone number and then fails at submit.

The build guard blocks the combination of an open funnel and a missing ЕИК.

### The build guard

`frontend/scripts/check-legal-values.mjs` runs automatically before every build
(npm `prebuild` hook). It is deliberately asymmetric, so the partner-preview
deploy keeps working while values are still being gathered:

| Build | Behaviour |
|---|---|
| Production | Blocking findings **fail the build** |
| Preview, branch, local | Everything is reported as a **warning**; build proceeds |

"Production" means `CONTEXT=production` (set by Netlify on production deploys),
or an explicit override:

- `REQUIRE_LEGAL_VALUES=true` — force blocking anywhere (use this in CI)
- `REQUIRE_LEGAL_VALUES=false` — force warn-only, a deliberate escape hatch

**Blocking:** company identity (§1), disclosures (§2), representative example
(§3).
**Warning:** VAT, empty partner list, unset domain, and the statutory warning
wording — the last of which **becomes blocking on 20 November 2026**, when the
Act is in force and shipping unconfirmed wording is a real breach. Confirm the
text and set `CREDIT_WARNING_CONFIRMED = true` in `config/legal.ts` before then.

---

## 1. Company identity

| # | Value | Placeholder | Where |
|---|---|---|---|
| 1.1 | Legal entity name (e.g. „Вейра“ ЕООД) | `[[TODO:COMPANY_LEGAL_NAME]]` | env `NEXT_PUBLIC_COMPANY_LEGAL_NAME` |
| 1.2 | ЕИК (company number) | `[[TODO:COMPANY_EIK]]` | env `NEXT_PUBLIC_COMPANY_EIK` |
| 1.3 | VAT number (if registered) | `[[TODO:COMPANY_VAT]]` | env `NEXT_PUBLIC_COMPANY_VAT` |
| 1.4 | Registered physical address | `[[TODO:REGISTERED_ADDRESS]]` | env `NEXT_PUBLIC_COMPANY_ADDRESS` |
| 1.5 | Contact phone | `[[TODO:CONTACT_PHONE]]` | env `NEXT_PUBLIC_COMPANY_PHONE` |
| 1.6 | Contact email | `hello@veyra.example` | env `NEXT_PUBLIC_CONTACT_EMAIL` |
| 1.7 | Data-protection email | `privacy@veyra.example` | env `NEXT_PUBLIC_PRIVACY_EMAIL` |

> 1.4 is not optional cosmetics: **a physical business address is a Google Ads
> financial-products requirement.** Paid traffic cannot run without it.

## 2. Google Ads disclosures `[LEGAL-DEADLINE]`

These must be visible on the landing page **without clicking, hovering,
expanding or opening a tab** — not in an accordion, not in a modal, not in the
footer alone.

| # | Value | Placeholder | Where |
|---|---|---|---|
| 2.1 | Minimum repayment term across the panel (months) | `[[TODO:TERM_MIN]]` | `frontend/config/disclosures.ts` |
| 2.2 | Maximum repayment term across the panel (months) | `[[TODO:TERM_MAX]]` | `frontend/config/disclosures.ts` |
| 2.3 | Maximum ГПР across the panel | `[[TODO:MAX_APR]]` | `frontend/config/disclosures.ts` |
| 2.4 | Full list of applicable fees | `[[TODO:FEES_LIST]]` | `frontend/config/disclosures.ts` |
| 2.5 | Minimum and maximum loan amount across the panel | — | needed for copy; not yet rendered |

## 3. Representative example (ЗПК чл. 25) `[LEGAL-DEADLINE]`

**Must be supplied or approved by a partner lender.** Do not synthesise it from
the credit calculator — a computed example is a fabricated financial promotion.

| # | Value | Placeholder |
|---|---|---|
| 3.1 | Example amount (EUR) | `[[TODO:EXAMPLE_AMOUNT]]` |
| 3.2 | Example term (months) | `[[TODO:EXAMPLE_TERM]]` |
| 3.3 | Fixed annual borrowing rate (%) | `[[TODO:EXAMPLE_RATE]]` |
| 3.4 | ГПР (%) | `[[TODO:EXAMPLE_APR]]` |
| 3.5 | Total amount repayable (EUR) | `[[TODO:EXAMPLE_TOTAL]]` |
| 3.6 | Monthly instalment (EUR) | `[[TODO:EXAMPLE_MONTHLY]]` |

All in `frontend/config/disclosures.ts`.

## 4. Partners

| # | Value | Placeholder | Where |
|---|---|---|---|
| 4.1 | Signed partner list — name, logo, link, each with written authorisation to use the name and mark | `[[TODO:PARTNER_LIST]]` | `frontend/config/partners.ts` |

Until this list is non-empty the homepage shows a **non-specific illustration**
instead of named partner cards. The previous "Партньор A / B / C" placeholders
have been removed — invented partner names are not an acceptable stand-in.

> Viva Credit exists in the backend seed (`seed_vivacredit`) as `PENDING` /
> inactive. Pipeline status is not publication clearance; do not add it here
> until terms are signed and name/logo use is authorised in writing.

## 5. Statutory wording to confirm `[LEGAL-DEADLINE]`

| # | Item | Placeholder | Where |
|---|---|---|---|
| 5.1 | Final mandatory credit-warning wording | `[[TODO:WARNING_WORDING]]` | `frontend/config/legal.ts` → `CREDIT_WARNING` |

Currently: `Внимание! Вземането на кредит струва пари.` (draft Act wording).
The directive's official BG text reads `Внимание! Заемането на пари струва пари.`
**Confirm against the published statute, then set `CREDIT_WARNING_CONFIRMED = true`.**

## 6. Recurring maintenance — not a one-off

| # | Item | Where | Cadence |
|---|---|---|---|
| 6.1 | ГПР cap (5 × statutory default rate = ECB MRO + 8pp) | `frontend/config/legal.ts` → `APR_CAP` | **Resets 1 January and 1 July** |

Current value: **52.00%**, effective 2026-07-01 (H1 2026 was 50.75%).
This is a moving number — it must never be hardcoded into copy or templates.

## 7. Domain

| # | Item | Where |
|---|---|---|
| 7.1 | Confirmed target domain (ideally `.bg`) | env `NEXT_PUBLIC_SITE_URL` |

The codebase reads the origin from that single variable — canonical tags, OG
URLs, sitemap and robots all derive from it. Nothing is hardcoded. Until it is
set, the build falls back to Netlify's own build-time `URL`, so a preview or
`*.netlify.app` deploy never claims to be the production domain. Migration
steps are documented in `netlify.toml`.

## 7b. Operational settings (not legal values, but set them)

| # | Item | Where | Note |
|---|---|---|---|
| 7b.1 | `CONSENT_TEXT_VERSION` | backend env | **Bump whenever the consent checkbox wording changes.** Recorded against every consent so you can prove what a user agreed to. Currently `2026-09-01`. |
| 7b.2 | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | frontend env | Search Console |
| 7b.3 | `NEXT_PUBLIC_BING_SITE_VERIFICATION` | frontend env | Bing Webmaster Tools |
| 7b.4 | `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | frontend env | Nothing loads until one is set **and** the visitor grants consent. |

Frontend variables are listed with comments in `frontend/.env.local.example`.

## 8. Bulgarian copy review

| # | Item | Where |
|---|---|---|
| 8.1 | **Native-speaker review of all Bulgarian copy** | `frontend/i18n/dictionaries/bg.ts`, `frontend/lib/landing-content.ts`, `frontend/lib/guides-content.ts` |

Flagged in a header comment at the top of `bg.ts`. Not signed-off copy.

**8.2 — Two decisions for the reviewer to confirm:**

1. **Register.** The site addresses the reader informally throughout (*ти*).
   The replacement copy supplied in the change brief was written formally
   (*Вие*). It was implemented in the site's existing informal register so the
   homepage and the application funnel do not clash mid-journey — the brief's
   substance (transparency framing, no speed claims) is unchanged. If the
   reviewer prefers formal throughout, that is a site-wide pass, not a
   homepage edit.

2. **Vocabulary.** The brief used *запитване* / *оферти*; the site's
   established terms are *заявка* / *възможности*, which are used consistently
   across the funnel, results, backend and SEO pages. The existing terms were
   kept.

**8.3 — One compliance judgement to confirm.** `бързи кредити` ("fast loans")
is retained as a product-category term on the organic-only landing pages,
along with cautionary uses ("обща цена за целия срок, не само бързината") and
honest deflections ("Veyra не превежда средства; скоростта зависи от
партньора"). None of these is a Veyra-voiced promise of speed. The brief
permits organic targeting of these terms (§3.4) while its checklist (§13) reads
stricter; those pages are marked `adEligible: false` so they can never be used
for paid traffic. If a reviewer disagrees, the pages come out.

---

## Compliance checks the code enforces (do not regress)

- No speed or ease claim about **obtaining credit**, in any language, anywhere —
  including `alt` text, meta descriptions and OG tags.
- No consent checkbox pre-ticked.
- No analytics or ad pixel fires before consent.
- No `Review` / `AggregateRating` structured data without genuine verifiable
  reviews.
- The ГПР cap, the warning text and the domain are never hardcoded.

---

*Regulatory points here are compiled from public sources and are not legal
advice. The Bulgarian Consumer Credit Act transposing EU Directive 2023/2225
must be confirmed with a Bulgarian adviser before 20 November 2026.*
