import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides-content";
import { SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  const canonical = `/guides/${g.slug}`;
  return {
    title: g.metaTitle,
    description: g.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: g.metaTitle,
      description: g.description,
      url: `${SITE_URL}${canonical}`,
      images: ["/og.png"],
    },
    twitter: { title: g.metaTitle, description: g.description, images: ["/og.png"] },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    inLanguage: "bg",
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@type": "Organization", name: "Veyra" },
    publisher: {
      "@type": "Organization",
      name: "Veyra",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/veyra-logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/guides/${g.slug}`,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map((f) => ({
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
            Ръководства
          </Link>{" "}
          / {g.title}
        </nav>
        <h1 className="t-h1 mt-4 text-ink">{g.title}</h1>
        <p className="mt-2 t-caption text-muted">
          {g.readingMinutes} мин четене · Обновено {g.updated}
        </p>
        <p className="mt-6 t-body text-muted">{g.intro}</p>

        <div className="mt-8 space-y-5">
          {g.blocks.map((b, i) => {
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
        <section className="mt-12 border-t border-slate-200/80 pt-8">
          <h2 className="t-h3 text-ink">Въпроси и отговори</h2>
          <div className="mt-5 space-y-5">
            {g.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-base font-bold text-ink">{f.q}</h3>
                <p className="mt-1 t-small text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="surface-dark mt-12 rounded-2xl px-7 py-9 text-center">
          <h2 className="t-h3 text-appwhite">Виж подходящите възможности за теб</h2>
          <p className="mx-auto mt-2 max-w-md t-small text-appmuted">
            Една заявка, няколко възможности. Без регистрация и без ангажимент.
          </p>
          <div className="mt-6">
            <Link href="/apply" className="btn-mint">
              Започни заявка<span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
