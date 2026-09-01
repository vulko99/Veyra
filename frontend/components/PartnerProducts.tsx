"use client";

import {
  publishablePartners,
  bgAmount,
  bgPct,
  bgDate,
  type PartnerLegal,
  type PartnerFees,
} from "@/config/partner-legal";
import { interpolate } from "@/i18n";
import { useMessages } from "@/hooks/useI18n";

/**
 * Per-partner legal & product information.
 *
 * Renders one block per partner that has passed `validatePartnerLegal()` — i.e.
 * every mandatory value is present, the representative example is internally
 * consistent, and the partner is "verified". Partners that are incomplete or
 * unverified are simply not returned by `publishablePartners()`, so nothing
 * unconfirmed ever reaches the public page. When no partner is publishable this
 * renders nothing, leaving the surrounding section unchanged.
 *
 * The statutory APR cap ("Законов таван на ГПР") is deliberately NOT repeated
 * here — it is a general legal figure shown once in <LegalDisclosures>, not a
 * partner value. The per-partner "Максимален ГПР на продукта" is a different
 * field and is shown below.
 */
export function PartnerProducts({ dark = false }: { dark?: boolean }) {
  const m = useMessages().legal;
  const partners = publishablePartners();
  if (partners.length === 0) return null;

  const rule = dark ? "border-appborder" : "border-slate-200";

  return (
    <div className={`mt-7 border-t pt-6 ${rule}`}>
      <h3 className="t-h3">{m.productsTitle}</h3>
      <p className={`mt-2 t-body ${dark ? "text-appmuted" : "text-muted"}`}>
        {m.productsIntro}
      </p>
      <div className="mt-5 space-y-5">
        {partners.map((p) => (
          <PartnerCard key={p.slug} partner={p} dark={dark} />
        ))}
      </div>
    </div>
  );
}

function PartnerCard({ partner, dark }: { partner: PartnerLegal; dark: boolean }) {
  const m = useMessages().legal;
  const label = dark ? "text-appmuted" : "text-muted";
  const rule = dark ? "border-appborder" : "border-slate-200";
  const surface = dark ? "border-appborder bg-appsurface" : "border-slate-200 bg-white";

  // Publishable partners have non-null values by construction (validation gate),
  // but we guard so this can never throw if called on an unvetted record.
  const rows: { label: string; value: string }[] = [];

  if (partner.termMinMonths != null && partner.termMaxMonths != null) {
    rows.push({
      label: m.termRangeLabel,
      value: interpolate(m.termRangeValue, {
        min: String(partner.termMinMonths),
        max: String(partner.termMaxMonths),
      }),
    });
  }
  if (partner.maxAprPct != null) {
    rows.push({ label: m.productMaxAprLabel, value: bgPct(partner.maxAprPct) });
  }
  rows.push({ label: m.feesLabel, value: feesText(partner.fees, m.noFeesConfirmed) });
  if (partner.registeredAddress) {
    rows.push({ label: m.addressLabel, value: partner.registeredAddress });
  }

  const ex = partner.representativeExample;

  return (
    <section className={`rounded-xl border p-5 sm:p-6 ${surface}`}>
      <h4 className="t-h3">{partner.name}</h4>

      <dl className={`mt-4 divide-y ${rule} border-t ${rule}`}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
          >
            <dt className={`t-body ${label}`}>{row.label}</dt>
            <dd className="t-body font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      {ex && (
        <div className={`mt-5 border-t pt-4 ${rule}`}>
          <h5 className="t-body font-semibold">{m.representativeTitle}</h5>
          <p className="mt-1.5 t-body">
            {interpolate(m.representativeExample, {
              amount: bgAmount(ex.amountEur),
              term: String(ex.termMonths),
              rate: bgPct(ex.annualInterestRatePct).replace("%", ""),
              apr: bgPct(ex.aprPct).replace("%", ""),
              total: bgAmount(ex.totalPayableEur),
              monthly: bgAmount(ex.monthlyPaymentEur),
            })}
          </p>
        </div>
      )}

      {partner.lastUpdated && (
        <p className={`mt-4 t-small ${label}`}>
          {interpolate(m.updatedLabel, { date: bgDate(partner.lastUpdated) })}
        </p>
      )}
    </section>
  );
}

/**
 * Fee display. An itemised list is shown verbatim; an explicitly confirmed
 * "no fees" shows the confirmed-no-fees line. A partner whose fees are not yet
 * confirmed is never publishable, so `fees` is never null here — the fallback
 * exists only for type-safety and shows nothing misleading.
 */
function feesText(fees: PartnerFees | null, noFeesConfirmed: string): string {
  if (!fees) return "—";
  if (fees.kind === "none") return noFeesConfirmed;
  return fees.items.join(" · ");
}
