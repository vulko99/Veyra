"use client";

import { COMPANY } from "@/config/company";
import { isTodo } from "@/config/legal";
import { useMessages } from "@/hooks/useI18n";

/**
 * Who the operator legally is: entity name, ЕИК, VAT, registered address and
 * contact details.
 *
 * A financial services site with no identifiable operator behind it fails on
 * trust, on Google Ads review (a physical business address is required) and on
 * basic consumer-protection expectations. Every field comes from
 * config/company.ts; nothing is invented, and unfilled values render as loud
 * placeholders rather than quietly disappearing.
 */
export function CompanyIdentity({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const m = useMessages().legal;
  const dark = tone === "dark";

  const rows: { label: string; value: string; href?: string }[] = [
    { label: m.companyLabel, value: COMPANY.legalName },
    { label: m.eikLabel, value: COMPANY.eik },
    { label: m.vatLabel, value: COMPANY.vat },
    { label: m.addressShortLabel, value: COMPANY.address },
    {
      label: m.phoneLabel,
      value: COMPANY.phone,
      href: isTodo(COMPANY.phone) ? undefined : `tel:${COMPANY.phone}`,
    },
    {
      label: m.emailLabel,
      value: COMPANY.contactEmail,
      href: `mailto:${COMPANY.contactEmail}`,
    },
  ];

  const labelCls = dark ? "text-white/45" : "text-muted";
  const valueCls = dark ? "text-white/80" : "text-ink";

  return (
    <div className={className}>
      <h2
        className={`text-xs font-semibold uppercase tracking-[0.16em] ${
          dark ? "text-white/45" : "text-muted"
        }`}
      >
        {m.identityTitle}
      </h2>
      <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-2">
            <dt className={`flex-none ${labelCls}`}>{row.label}:</dt>
            <dd className={valueCls}>
              {isTodo(row.value) ? (
                <mark className="rounded bg-red-500 px-1.5 py-0.5 font-mono text-[0.8em] font-bold text-white">
                  {row.value}
                </mark>
              ) : row.href ? (
                <a href={row.href} className="hover:text-mint">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
