import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, getGuideCopy } from "@/lib/guides-content";
import { SITE_URL } from "@/lib/seo";
import { type Locale } from "@/i18n/config";
import { getMessages, interpolate } from "@/i18n";
import { localePath } from "@/lib/locale";
import { JsonLd } from "@/components/JsonLd";
import { StartCta } from "@/components/LandingCtas";
import { TrackView } from "@/components/TrackView";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; locale: Locale };
}): Metadata {
  const copy = getGuideCopy(params.slug, params.locale);
  if (!copy) return {};
  // Both languages are real articles, so each canonicalises to its own URL and
  // the two are cross-declared. Bulgarian is x-default: it is the primary
  // locale and the unprefixed address.
  const path = `/guides/${params.slug}`;
  const canonical = localePath(params.locale, path);
  return {
    title: copy.metaTitle,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        bg: path,
        en: localePath("en", path),
        "x-default": path,
      },
    },
    openGraph: {
      type: "article",
      title: copy.metaTitle,
      description: copy.description,
      url: `${SITE_URL}${canonical}`,
      images: ["/og.png"],
    },
    twitter: {
      title: copy.metaTitle,
      description: copy.description,
      images: ["/og.png"],
    },
  };
}

export default function GuidePage({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  const copy = g.copy[params.locale];
  const m = getMessages(params.locale);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.description,
    inLanguage: params.locale,
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@type": "Organization", name: "Veyra" },
    publisher: {
      "@type": "Organization",
      name: "Veyra",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/veyra-logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${localePath(
      params.locale,
      `/guides/${g.slug}`
    )}`,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="relative">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <TrackView event="landing_view" page={`guide:${g.slug}`} />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      <article className="container-x max-w-2xl py-16 sm:py-20">
        <nav className="t-caption text-muted">
          <Link href="/guides" className="hover:text-mint-600">
            {m.guides.breadcrumb}
          </Link>{" "}
          / {copy.title}
        </nav>
        <h1 className="t-h1 mt-4 text-ink">{copy.title}</h1>
        <p className="mt-2 t-caption text-muted">
          {interpolate(m.guides.readingTime, { minutes: g.readingMinutes })} ·{" "}
          {interpolate(m.guides.updated, { date: g.updated })}
        </p>
        <p className="mt-6 t-body text-muted">{copy.intro}</p>

        {/* Load, not scroll: the article body starts right under the intro, so
            it is on screen when the page arrives and the scroll reveal would
            stand down and leave it as the only static thing on the page. */}
        <div className="reveal-load mt-8 space-y-5">
          {copy.blocks.map((b, i) => {
            if (b.type === "h2")
              return (
                <h2 key={i} className="t-h3 pt-4 text-ink">
                  {b.text}
                </h2>
              );
            if (b.type === "p")
              return (
                <p key={i} className="t-body text-muted">
                  {b.text}
                </p>
              );
            if (b.type === "callout")
              return (
                <p
                  key={i}
                  className="rounded-xl border border-mint/25 bg-mint/5 px-4 py-3 t-small text-ink"
                >
                  {b.text}
                </p>
              );
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-2.5 t-body text-muted">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-mint" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="reveal-scroll mt-12 border-t border-slate-200/80 pt-8">
          <h2 className="t-h3 text-ink">{m.guides.faqTitle}</h2>
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
        <div className="reveal-scroll surface-dark mt-12 rounded-2xl px-7 py-9 text-center">
          <h2 className="t-h3 text-appwhite">{m.guides.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-md t-small text-appmuted">
            {m.guides.ctaBody}
          </p>
          <div className="mt-6">
            <StartCta location="guide" />
          </div>
        </div>
      </article>
    </div>
  );
}
