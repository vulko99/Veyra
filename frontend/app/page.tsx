"use client";

import Link from "next/link";
import { useMessages } from "@/hooks/useI18n";
import { MatchingViz } from "@/components/MatchingViz";

export default function HomePage() {
  const m = useMessages();

  return (
    <>
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
              <Link href="/apply" className="btn-mint">
                {m.home.primaryCta}
                <span aria-hidden>→</span>
              </Link>
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
            {m.home.stepsIntro}
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

      {/* Steps */}
      <section className="bg-white py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="eyebrow">{m.home.stepsTitle}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">
              {m.home.stepsTitle}
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {m.home.steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  {i < m.home.steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-slate-200 md:block" />
                  )}
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-electric/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-mint/25 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {m.home.ctaTitle}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            {m.home.ctaBody}
          </p>
          <div className="relative mt-9">
            <Link href="/apply" className="btn-mint">
              {m.home.primaryCta}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
