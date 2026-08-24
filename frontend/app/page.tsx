"use client";

import Link from "next/link";
import { useMessages } from "@/hooks/useI18n";

export default function HomePage() {
  const m = useMessages();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {m.home.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              {m.home.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {m.home.subhead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply" className="btn-accent">
                {m.common.checkOptions}
              </Link>
              <Link href="/how-it-works" className="btn-ghost">
                {m.nav.howItWorks}
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">{m.common.noGuarantee}</p>
          </div>

          <div className="relative">
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {m.home.yourRequest}
                </p>
                <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-600">
                  {m.home.illustrationTag}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{m.home.amount}</p>
                  <p className="text-2xl font-bold text-navy-900">3 000 лв.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{m.home.term}</p>
                    <p className="text-lg font-semibold text-navy-900">
                      {m.home.termValue}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      {m.home.relevantOptions}
                    </p>
                    <p className="text-lg font-semibold text-navy-900">
                      {m.home.relevantOptionsValue}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  {m.home.partnerPlaceholder}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="container-x grid gap-8 py-10 sm:grid-cols-3">
          {m.home.trust.map((t) => (
            <div key={t.label} className="text-center">
              <p className="text-3xl font-bold text-navy-800">{t.stat}</p>
              <p className="mt-1 text-sm text-slate-500">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">
            {m.home.stepsTitle}
          </h2>
          <p className="mt-3 text-slate-600">{m.home.stepsIntro}</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {m.home.steps.map((step, i) => (
            <div key={step.title} className="card p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 text-lg font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-8">
        <div className="rounded-2xl bg-navy-800 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">{m.home.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">{m.home.ctaBody}</p>
          <div className="mt-8">
            <Link href="/apply" className="btn-accent">
              {m.common.checkOptions}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
