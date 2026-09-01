"use client";

import {
  DISCLOSURES,
  DISCLOSURES_INCOMPLETE,
  REPRESENTATIVE_EXAMPLE,
} from "@/config/disclosures";
import { COMPANY } from "@/config/company";
import { formatAprCap, HIDE_UNFILLED, isTodo } from "@/config/legal";
import { TodoMark } from "@/components/TodoMark";
import { PartnerProducts } from "@/components/PartnerProducts";
import { interpolate } from "@/i18n";
import { useMessages } from "@/hooks/useI18n";

/**
 * The disclosures Google Ads' financial-products policy requires, plus the
 * representative example required by ЗПК чл. 25.
 *
 * Google's policy applies identically to lenders, lead generators and sites
 * that connect consumers to third-party lenders — being an intermediary is not
 * an exemption. Without this block, paid traffic cannot run to the site at all.
 *
 * It must be visible WITHOUT clicking, hovering, expanding, or scrolling into
 * a tab. So: no accordion, no modal, no footer-only placement.
 *
 * ЗПК чл. 25 additionally requires the standard information to be presented in
 * type NO LESS PROMINENT than the rest of the advertisement. That is why every
 * value here uses `t-body` at full contrast (`text-ink`, not `text-muted`) and
 * the representative example is not visually demoted. Do not "tidy" this into
 * smaller or greyer text.
 *
 * Follows the active locale: labels come from the message catalog, values from
 * config. Next server-renders client components, so the block is still present
 * in the initial HTML, which is what ad review and no-JS crawlers see.
 */
export function LegalDisclosures({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const m = useMessages().legal;
  const dark = tone === "dark";

  const termRange = interpolate(m.termRangeValue, {
    min: DISCLOSURES.termMinMonths,
    max: DISCLOSURES.termMaxMonths,
  });

  const example = interpolate(m.representativeExample, {
    amount: REPRESENTATIVE_EXAMPLE.amountEur,
    term: REPRESENTATIVE_EXAMPLE.termMonths,
    rate: REPRESENTATIVE_EXAMPLE.ratePct,
    apr: REPRESENTATIVE_EXAMPLE.aprPct,
    total: REPRESENTATIVE_EXAMPLE.totalEur,
    monthly: REPRESENTATIVE_EXAMPLE.monthlyEur,
  });

  // The address is a required disclosure but lives in COMPANY, so the
  // "unfilled" banner has to account for it as well.
  const incomplete = DISCLOSURES_INCOMPLETE || isTodo(COMPANY.address);

  const hasTodo = (v: string) => /\[\[TODO:[A-Z_]+\]\]/.test(v);
  const allRows = [
    { label: m.termRangeLabel, value: termRange },
    { label: m.maxAprLabel, value: DISCLOSURES.maxAPR },
    { label: m.aprCapLabel, value: formatAprCap(), note: m.aprCapNote },
    { label: m.feesLabel, value: DISCLOSURES.fees },
    { label: m.addressLabel, value: COMPANY.address },
  ];
  const rows = HIDE_UNFILLED ? allRows.filter((r) => !hasTodo(r.value)) : allRows;
  const showExample = !HIDE_UNFILLED || !hasTodo(example);

  const surface = dark
    ? "border-appborder bg-appsurface text-appwhite"
    : "border-slate-200 bg-white text-ink";
  const label = dark ? "text-appmuted" : "text-muted";
  const rule = dark ? "border-appborder" : "border-slate-200";

  return (
    <section
      aria-labelledby="legal-disclosures-title"
      className={`rounded-2xl border p-6 sm:p-8 ${surface} ${className}`}
    >
      <h2 id="legal-disclosures-title" className="t-h3">
        {m.disclosuresTitle}
      </h2>
      <p className={`mt-2 t-body ${label}`}>{m.disclosuresIntro}</p>

      {incomplete &&
        (HIDE_UNFILLED ? (
          // Rows that are not ready are omitted above, so this states plainly
          // that the block is not complete yet. Without it the panel would
          // read as finished when it is not. The build guard, not this line,
          // is what actually stops it reaching production.
          <p className={`mt-3 t-small ${label}`}>{m.pendingNotice}</p>
        ) : (
          <p className="mt-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 t-body font-bold text-red-900">
            {m.unfilledNotice}
          </p>
        ))}

      {/* Required disclosures 1-5. Full contrast, body size — never fine print.
          In the local preview mode a row whose value is not yet supplied is
          omitted instead of showing a gap; the statutory APR cap is a real
          published figure and always remains. */}
      <dl className={`mt-6 divide-y ${rule} border-t ${rule}`}>
        {rows.map((row) => (
          <Row
            key={row.label}
            label={row.label}
            value={row.value}
            note={row.note}
            dark={dark}
          />
        ))}
      </dl>

      {/* Representative example — ЗПК чл. 25. Same type size and contrast as
          the copy around it, by law. Its six values are supplied by a partner,
          so before any partner is signed there is nothing to show. */}
      {showExample && (
        <div className={`mt-7 border-t pt-6 ${rule}`}>
          <h3 className="t-h3">{m.representativeTitle}</h3>
          <p className="mt-2 t-body">
            <Value value={example} dark={dark} />
          </p>
        </div>
      )}

      {/* Per-partner product & legal information. Renders one block per
          partner cleared by validatePartnerLegal(); nothing at all while no
          partner is fully verified, so the panel above is unaffected. */}
      <PartnerProducts dark={dark} />

      <div className={`mt-6 space-y-1.5 border-t pt-5 ${rule} t-body ${label}`}>
        <p>{m.notALender}</p>
        <p>{m.freeForYou}</p>
        <p>{m.minAge}</p>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  note,
  dark,
}: {
  label: string;
  value: string;
  note?: string;
  dark: boolean;
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
      <dt className={`t-body ${dark ? "text-appmuted" : "text-muted"}`}>{label}</dt>
      <dd className="t-body font-medium">
        <Value value={value} dark={dark} />
        {note && (
          <span className={`mt-0.5 block t-small ${dark ? "text-appmuted" : "text-muted"}`}>
            {note}
          </span>
        )}
      </dd>
    </div>
  );
}

/**
 * Renders a config value, or — when it is still an unfilled [[TODO:*]]
 * placeholder — renders it LOUDLY rather than blank. An unsupplied regulated
 * value must fail visibly in review, never degrade into something that looks
 * intentional.
 */
function Value({ value, dark }: { value: string; dark: boolean }) {
  const parts = value.split(/(\[\[TODO:[A-Z_]+\]\])/g);
  if (parts.length === 1) return <>{value}</>;
  return (
    <>
      {parts.map((part, i) =>
        isTodo(part) ? (
          <TodoMark key={i} value={part} />
        ) : (
          <span key={i} className={dark ? "text-appwhite" : "text-ink"}>
            {part}
          </span>
        )
      )}
    </>
  );
}
