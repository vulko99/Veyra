import Link from "@/components/LocaleLink";
import type { Landing } from "@/lib/landing-content";
import { JsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";
import { CreditWarning } from "@/components/CreditWarning";
import { StartCta, CalculatorLink } from "@/components/LandingCtas";
import { LegalDisclosures } from "@/components/LegalDisclosures";
import { BgOnlyNotice } from "@/components/BgOnlyNotice";
import { SITE_URL } from "@/lib/seo";

// Internal links surfaced on every landing page so growth pages (which are not
// all in the primary nav) stay linked and share crawl/link equity.
const RELATED = [
  { href: "/krediti", label: "Кредити онлайн" },
  { href: "/potrebitelski-kredit", label: "Потребителски кредит" },
  { href: "/kredit-za-avtomobil", label: "Кредит за автомобил" },
  { href: "/kredit-za-remont", label: "Кредит за ремонт" },
  { href: "/barzi-krediti", label: "Бързи кредити" },
  { href: "/loans", label: "Видове кредити" },
  { href: "/kalkulator", label: "Кредитен калкулатор" },
  { href: "/guides", label: "Ръководства" },
];

// Relevant educational guides linked from every landing page.
const GUIDE_LINKS = [
  { href: "/guides/kakvo-e-gpr", label: "Какво е ГПР?" },
  { href: "/guides/mesechna-vnoska", label: "Каква месечна вноска мога да си позволя?" },
];

/** Server-rendered SEO landing page: useful content + one clear CTA into the
 *  Veyra application. Static HTML (fast, crawlable) with a tiny view-tracking
 *  island. Marketplace framing; no approval claims. */
export function LandingPage({ data }: { data: Landing }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: data.eyebrow,
        item: `${SITE_URL}/${data.slug}`,
      },
    ],
  };

  return (
    <div className="under-nav relative">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumb} />
      <TrackView event="landing_view" page={data.slug} />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 grid-lines mask-fade-b opacity-60" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      {/* Every string below is Bulgarian, including the headings and CTAs, so
          the element is marked as such. On /en/<slug> the document is
          `lang="en"` for the chrome; without this a screen reader would read
          Bulgarian prose with English pronunciation rules. */}
      <div lang="bg" className="container-x max-w-3xl py-16 sm:py-20">
        <header className="reveal">
          <BgOnlyNotice className="mb-6" />
          <span className="eyebrow">{data.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{data.h1}</h1>
          <p className="mt-5 t-body text-muted">{data.intro}</p>

          {/* Mandatory credit warning — these pages advertise credit. Kept in
              the body flow, above the fold-ish, never as footer fine print. */}
          <CreditWarning className="mt-6" />
          <div className="mt-8 flex flex-col gap-3 min-[480px]:flex-row">
            <StartCta location={`landing:${data.slug}`} />
            <CalculatorLink />
          </div>
        </header>

        <div className="mt-14 space-y-10">
          {data.sections.map((s) => (
            <section key={s.h2} className="reveal-scroll border-t border-slate-200/80 pt-7">
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
        <nav aria-label="Свързани страници" className="reveal-scroll mt-12 flex flex-wrap gap-2.5">
          {RELATED.filter((r) => r.href !== `/${data.slug}`).map((r) => (
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
          <h2 className="t-h3 text-ink">Полезно четиво</h2>
          <ul className="mt-4 space-y-2">
            {GUIDE_LINKS.map((g) => (
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
          <h2 className="t-h3 text-ink">Често задавани въпроси</h2>
          <div className="mt-5 space-y-5">
            {data.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-base font-bold text-ink">{f.q}</h3>
                <p className="mt-1 t-small text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="reveal-scroll surface-dark relative mt-14 overflow-hidden rounded-[2rem] px-8 py-12 text-center sm:px-14">
          <h2 className="t-h2 text-appwhite">{data.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl t-body text-appmuted">{data.ctaBody}</p>
          <div className="mt-7">
            <StartCta location={`landing_cta:${data.slug}`} />
          </div>
          <p className="mt-5 t-caption text-appmuted">
            Veyra не е кредитор. Окончателното решение и условията се определят от съответния партньор.
          </p>
        </div>
      </div>
    </div>
  );
}
