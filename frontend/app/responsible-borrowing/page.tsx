"use client";

import { useEffect } from "react";
import { useMessages } from "@/hooks/useI18n";

export default function ResponsibleBorrowingPage() {
  const m = useMessages();
  const r = m.responsible;

  useEffect(() => {
    document.title = `${r.title} — Veyra`;
  }, [r.title]);

  return (
    <div>
      {/* dark editorial hero */}
      <section className="surface-dark relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] grid-lines" />
        <div className="container-x max-w-4xl py-20 sm:py-28">
          <div className="reveal">
            <span className="a-eyebrow">{r.title}</span>
            <h1 className="mt-5 t-display text-appwhite">
              {r.heroA}
              <br />
              <span className="brand-gradient-text">{r.heroB}</span>
            </h1>
            <p className="mt-6 max-w-xl t-body text-appmuted">{r.heroSub}</p>
          </div>
        </div>
      </section>

      {/* light callouts */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
        <div className="container-x max-w-4xl py-16">
          <h2 className="t-h2 text-ink">{r.calloutsTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {r.callouts.map((c, i) => (
              <div key={c.label} className="card-outline flex gap-4 p-5">
                <span className="brand-gradient grid h-10 w-10 flex-none place-items-center rounded-xl font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">{c.label}</h3>
                  <p className="mt-1 t-small text-muted">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* editorial detail */}
      <section className="container-x max-w-3xl pb-24">
        <div className="space-y-8">
          {r.sections.map((s) => (
            <div key={s.heading} className="border-t border-slate-200/80 pt-7">
              <h3 className="t-h3 text-ink">{s.heading}</h3>
              <p className="mt-2 t-body text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
