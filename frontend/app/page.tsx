"use client";

import Link from "next/link";
import { useMessages } from "@/hooks/useI18n";
import { MatchingViz } from "@/components/MatchingViz";
import { JsonLd } from "@/components/JsonLd";
import { CreditWarning } from "@/components/CreditWarning";
import { PrimaryCta } from "@/components/PrimaryCta";
import { LegalDisclosures } from "@/components/LegalDisclosures";
import { track } from "@/lib/analytics";
import { SITE_URL } from "@/lib/seo";
import { companyJsonLdFields } from "@/config/company";

// Homepage structured data. FinancialService describes what Veyra does; the
// company's own identity lives in the Organization block in the root layout.
//
// Deliberately NO Review or AggregateRating markup: there are no genuine,
// verifiable reviews, and fabricating them is both a Google penalty and a
// consumer-protection violation. Do not add it without real reviews.
const financialServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Veyra",
  url: SITE_URL,
  areaServed: { "@type": "Country", name: "Bulgaria" },
  currenciesAccepted: "EUR",
  serviceType: "Consumer credit comparison marketplace",
  ...companyJsonLdFields(),
};

export default function HomePage() {
  const m = useMessages();

  return (
    <>
      <JsonLd data={financialServiceJsonLd} />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines mask-fade-b opacity-70" />
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-mint/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-electric/10 blur-3xl" />

        <div className="container-x grid items-center gap-14 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
          <div className="reveal">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              {m.home.badge}
            </span>
            <h1 className="mt-6 font-display text-[2.9rem] font-extrabold leading-[1.02] tracking-tightest text-ink sm:text-6xl">
              {m.home.h1a}
              <br />
              <span className="text-gradient">{m.home.h1b}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {m.home.subhead}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryCta label={m.home.primaryCta} location="hero" />
              <Link href="/how-it-works" className="btn-ghost">
                {m.home.secondaryCta}
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted/80">{m.common.disclaimer}</p>
          </div>

          <div className="reveal">
            <MatchingViz />
          </div>
        </div>
      </section>

      {/* Mandatory credit warning (Consumer Credit Act, in force 20 Nov 2026).
          Must stay here in the body flow: not the footer, not behind a click,
          not shrunk to fine print. */}
      <section className="container-x pb-10">
        <CreditWarning />
      </section>

      {/* Trust band */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="container-x grid divide-y divide-slate-200/70 py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {m.home.trust.map((t) => (
            <div key={t.label} className="flex items-baseline gap-3 px-2 py-5 sm:justify-center">
              <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
                {t.stat}
              </span>
              <span className="text-sm text-muted">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container-x py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">{m.home.featuresTitle}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">
            {m.home.featuresIntro}
          </h2>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {m.home.features.map((feat, i) => (
            <div key={feat.title} className="relative">
              <div className="mb-5 h-px w-full bg-gradient-to-r from-ink/25 to-transparent" />
              <span className="font-display text-sm font-bold text-mint-600">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-ink">
                {feat.title}
              </h3>
              <p className="mt-2.5 leading-relaxed text-muted">{feat.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps — dark dual-surface panel (product moment inside marketing) */}
      <section className="container-x py-20">
        <div className="surface-dark relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-16">
          <div className="max-w-2xl">
            <span className="a-eyebrow">{m.home.stepsTitle}</span>
            <h2 className="t-h2 mt-4 text-appwhite">{m.home.stepsIntro}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {m.home.steps.map((step, i) => (
              <div key={step.title} className="card-navy relative p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="brand-gradient grid h-10 w-10 place-items-center rounded-xl font-display text-base font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  {i < m.home.steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-gradient-to-r from-mint/50 to-transparent md:block" />
                  )}
                </div>
                <h3 className="t-h3 mt-5 text-appwhite">{step.title}</h3>
                <p className="mt-2 t-small text-appmuted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace — one application, several scored opportunities */}
      <section className="container-x py-20">
        <div className="max-w-2xl">
          <span className="eyebrow">{m.home.marketplace.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">
            {m.home.marketplace.title}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{m.home.marketplace.body}</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[94, 89, 84].map((score, i) => (
            <div
              key={i}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 transition-colors hover:border-mint/50"
            >
              {/* left brand rail */}
              <span className="absolute inset-y-0 left-0 w-1 brand-gradient opacity-70" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-canvas font-display text-base font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-ink">
                      {m.home.viz.option} {i + 1}
                    </p>
                    <p className="t-caption text-muted">{m.home.marketplace.note}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold brand-gradient-text">
                    {score}%
                  </span>
                  <span className="text-sm text-muted">{m.home.marketplace.compatibility}</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-transform group-hover:translate-x-0.5">
                  {m.home.marketplace.cta}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 max-w-3xl t-small text-muted/90">
          {m.home.marketplace.explainer}
        </p>
        <p className="mt-2 max-w-3xl t-caption text-muted/70">
          {m.home.marketplace.illustrative}
        </p>
      </section>

      {/* Mandatory disclosures — required by the Google Ads financial
          products policy and by ЗПК чл. 25. Plain page content: no accordion,
          no modal, no footer-only placement. */}
      <section className="container-x pb-20">
        <LegalDisclosures />
      </section>

      {/* CTA */}
      <section className="container-x pb-4">
        <div className="surface-dark relative overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-16">
          <h2 className="relative mx-auto max-w-2xl t-h1 text-white">
            {m.home.ctaTitle}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-appmuted">
            {m.home.ctaBody}
          </p>
          <div className="relative mt-9">
            <PrimaryCta label={m.home.primaryCta} location="home_cta" />
          </div>
        </div>
      </section>
    </>
  );
}
