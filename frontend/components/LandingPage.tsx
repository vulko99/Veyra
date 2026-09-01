import Link from "@/components/LocaleLink";
import { getLandingCopy, type Landing } from "@/lib/landing-content";
import { getGuideCopy } from "@/lib/guides-content";
import { JsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";
import { CreditWarning } from "@/components/CreditWarning";
import { StartCta, SecondaryCta } from "@/components/LandingCtas";
import { LegalDisclosures } from "@/components/LegalDisclosures";
import { SITE_URL } from "@/lib/seo";
import { getMessages } from "@/i18n";
import { type Locale } from "@/i18n/config";
import { localePath } from "@/lib/locale";
import { PRELAUNCH } from "@/config/launch";

// Internal links surfaced on every landing page so growth pages (which are not
// all in the primary nav) stay linked and share crawl/link equity.
//
// Held as slugs, not as {href,label} pairs: each landing page already names
// itself in both languages via its eyebrow, so deriving the label keeps these
// links in the reader's language without a second copy of the same words.
const RELATED_LANDINGS = [
  "krediti",
  "potrebitelski-kredit",
  "kredit-za-avtomobil",
  "kredit-za-remont",
  "barzi-krediti",
];

// Relevant educational guides linked from every landing page — same reasoning:
// the label is the guide's own title in the active locale.
const RELATED_GUIDES = ["kakvo-e-gpr", "mesechna-vnoska"];

/** Server-rendered SEO landing page: useful content + one clear CTA into the
 *  Veyra application. Static HTML (fast, crawlable) with a tiny view-tracking
 *  island. Marketplace framing; no approval claims. */
export function LandingPage({ data, locale }: { data: Landing; locale: Locale }) {
  const m = getMessages(locale);
  const copy = data.copy[locale];
  const path = localePath(locale, `/${data.slug}`);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: m.landing.breadcrumbHome,
        item: `${SITE_URL}${localePath(locale, "/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.eyebrow,
        item: `${SITE_URL}${path}`,
      },
    ],
  };

  const related = [
    ...RELATED_LANDINGS.flatMap((slug) => {
      const c = getLandingCopy(slug, locale);
      return c ? [{ href: `/${slug}`, label: c.eyebrow }] : [];
    }),
    { href: "/loans", label: m.landing.links.loanTypes },
    { href: "/kalkulator", label: m.landing.links.calculator },
    { href: "/guides", label: m.landing.links.guides },
  ].filter((r) => r.href !== `/${data.slug}`);

  const guideLinks = RELATED_GUIDES.flatMap((slug) => {
    const c = getGuideCopy(slug, locale);
    return c ? [{ href: `/guides/${slug}`, label: c.title }] : [];
  });

  return (
    <div className="under-nav relative">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumb} />
      <TrackView event="landing_view" page={data.slug} />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 grid-lines mask-fade-b opacity-60" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      {/* No `lang` override here: the article is written in the locale the
          document already declares, so the page reads — and is read aloud —
          in one language throughout. */}
      <div className="container-x max-w-3xl py-16 sm:py-20">
        <header className="reveal">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{copy.h1}</h1>
          <p className="mt-5 t-body text-muted">{copy.intro}</p>

          {/* Mandatory credit warning — these pages advertise credit. Kept in
              the body flow, above the fold-ish, never as footer fine print. */}
          <CreditWarning className="mt-6" />
          <div className="mt-8 flex flex-col gap-3 min-[480px]:flex-row">
            <StartCta location={`landing:${data.slug}`} />
            <SecondaryCta />
          </div>
        </header>

        <div className="mt-14 space-y-10">
          {copy.sections.map((s, i) => (
            <section
              key={s.h2}
              // The first section is usually at or just below the fold when the
              // page arrives, which is exactly where the scroll reveal stands
              // down. It gets the load animation so it is not the one block on
              // the page that never moves.
              className={`${
                i === 0 ? "reveal-load" : "reveal-scroll"
              } border-t border-slate-200/80 pt-7`}
            >
              <h2 className="t-h3 text-ink">{s.h2}</h2>
              {s.body && <p className="mt-2 t-body text-muted">{s.body}</p>}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 t-body text-muted">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-mint" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Related internal links (keeps growth pages linked, spreads equity) */}
        <nav
          aria-label={m.landing.relatedLabel}
          className="reveal-scroll mt-12 flex flex-wrap gap-2.5"
        >
          {related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-mint/50 hover:text-mint-600"
            >
              {r.label}
            </Link>
          ))}
        </nav>

        {/* Relevant guides */}
        <section className="reveal-scroll mt-12 border-t border-slate-200/80 pt-8">
          <h2 className="t-h3 text-ink">{m.landing.readingTitle}</h2>
          <ul className="mt-4 space-y-2">
            {guideLinks.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="t-body text-mint-600 hover:underline">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Mandatory disclosures — required by the Google Ads financial
            products policy and by ЗПК чл. 25. */}
        <LegalDisclosures className="reveal-scroll mt-14" />

        {/* FAQ */}
        <section className="reveal-scroll mt-14 border-t border-slate-200/80 pt-8">
          <h2 className="t-h3 text-ink">{m.landing.faqTitle}</h2>
          <div className="mt-5 space-y-5">
            {copy.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-base font-bold text-ink">{f.q}</h3>
                <p className="mt-1 t-small text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="reveal-scroll surface-dark relative mt-14 overflow-hidden rounded-[2rem] px-8 py-12 text-center sm:px-14">
          {/* Pre-launch the button below goes to the calculator, not the
              funnel, so each page's own closing copy — "кандидатствай онлайн с
              една заявка" and friends — would promise something the button
              cannot do. The per-page pair returns untouched at launch.

              Read from the reader's own catalogue. The version this merged with
              deliberately read the Bulgarian one, because at the time the card
              sat inside a `lang="bg"` article whose copy was Bulgarian in every
              locale — a localized string there would have been English inside
              Bulgarian prose. That is no longer true: these pages are now
              genuinely translated and the `lang` override is gone, so the
              Bulgarian catalogue would be the thing that looks wrong. */}
          <h2 className="t-h2 text-appwhite">
            {PRELAUNCH ? m.prelaunch.closingTitle : copy.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl t-body text-appmuted">
            {PRELAUNCH ? m.prelaunch.closingBody : copy.ctaBody}
          </p>
          <div className="mt-7">
            <StartCta location={`landing_cta:${data.slug}`} />
          </div>
          <p className="mt-5 t-caption text-appmuted">{m.landing.notLender}</p>
        </div>
      </div>
    </div>
  );
}
