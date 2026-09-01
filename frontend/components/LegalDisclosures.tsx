import {
  DISCLOSURES,
  DISCLOSURES_INCOMPLETE,
  REPRESENTATIVE_EXAMPLE,
} from "@/config/disclosures";
import { COMPANY } from "@/config/company";
import { formatAprCap, isTodo } from "@/config/legal";
import { defaultLocale } from "@/i18n/config";
import { getMessages, interpolate } from "@/i18n";

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
 * Deliberately hook-free and context-free, so it renders identically on the
 * server and the client and is always present in the server-rendered HTML —
 * which is what ad review and no-JS crawlers see.
 */
export function LegalDisclosures({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const m = getMessages(defaultLocale).legal;
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

      {incomplete && (
        <p className="mt-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 t-body font-bold text-red-900">
          {m.unfilledNotice}
        </p>
      )}

      {/* Required disclosures 1-5. Full contrast, body size — never fine print. */}
      <dl className={`mt-6 divide-y ${rule} border-t ${rule}`}>
        <Row label={m.termRangeLabel} value={termRange} dark={dark} />
        <Row label={m.maxAprLabel} value={DISCLOSURES.maxAPR} dark={dark} />
        <Row
          label={m.aprCapLabel}
          value={formatAprCap()}
          note={m.aprCapNote}
          dark={dark}
        />
        <Row label={m.feesLabel} value={DISCLOSURES.fees} dark={dark} />
        <Row label={m.addressLabel} value={COMPANY.address} dark={dark} />
      </dl>

      {/* Representative example — ЗПК чл. 25. Same type size and contrast as
          the copy around it, by law. */}
      <div className={`mt-7 border-t pt-6 ${rule}`}>
        <h3 className="t-h3">{m.representativeTitle}</h3>
        <p className="mt-2 t-body">
          <Value value={example} dark={dark} />
        </p>
      </div>

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
          <mark
            key={i}
            className="mx-0.5 rounded bg-red-500 px-1.5 py-0.5 font-mono text-[0.8em] font-bold text-white"
          >
            {part}
          </mark>
        ) : (
          <span key={i} className={dark ? "text-appwhite" : "text-ink"}>
            {part}
          </span>
        )
      )}
    </>
  );
}
