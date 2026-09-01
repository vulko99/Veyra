"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMessages } from "@/hooks/useI18n";
import { PrimaryCta } from "@/components/PrimaryCta";

export default function HowItWorksPage() {
  const m = useMessages();
  const j = m.home.steps; // reuse the 3-step journey copy
  const viz = m.home.viz;

  useEffect(() => {
    document.title = `${m.howItWorks.title} — Veyra`;
  }, [m.howItWorks.title]);

  return (
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 grid-lines mask-fade-b opacity-60" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />

      <div className="container-x max-w-5xl py-20">
        {/* header */}
        {/* No eyebrow: it read "Veyra", which the logo two rows above already
            says. An eyebrow should name the topic, not the brand. */}
        <div className="reveal max-w-2xl">
          <h1 className="t-h1 text-ink">{m.howItWorks.title}</h1>
          <p className="mt-5 t-body max-w-[52ch] text-muted">{m.howItWorks.intro}</p>
        </div>

        {/* journey 01 / 02 / 03 */}
        <div className="reveal-scroll mt-16 grid gap-6 md:grid-cols-3">
          {j.map((step, i) => (
            <div key={step.title} className="relative">
              {i < j.length - 1 && (
                <span className="absolute left-[calc(100%-0.75rem)] top-7 hidden h-px w-6 bg-gradient-to-r from-mint to-transparent md:block" />
              )}
              <div className="card-outline h-full p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold brand-gradient-text">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="t-h3 mt-4 text-ink">{step.title}</h3>
                <p className="mt-2 t-small text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* matching diagram — dark product moment */}
        <div className="reveal-scroll surface-dark mt-10 overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-0 text-center">
            <Node label={viz.request} sub={viz.requestValue} tone="glass" />
            <Connector />
            <Node label={viz.engine} sub={viz.engineNote} tone="engine" />
            <Connector fan />
            <div className="grid w-full grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-navy px-2 py-3 text-center">
                  <span className="text-[0.72rem] font-semibold text-appwhite">
                    {viz.option} {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* detail sections as outlined cards */}
        {/* Five items in two columns left the last card stranded beside an
            empty cell. An odd count gives the final card the full width, so
            the grid always has exactly as many cells as there is content. */}
        <div className="reveal-scroll mt-16 grid gap-5 sm:grid-cols-2">
          {m.howItWorks.sections.map((s, i) => {
            const wide =
              m.howItWorks.sections.length % 2 === 1 &&
              i === m.howItWorks.sections.length - 1;
            return (
              <div
                key={s.heading}
                className={`card-outline p-6 ${
                  wide ? "bg-mint-50/70 sm:col-span-2 sm:p-7" : ""
                }`}
              >
                <h3 className="t-h3 text-ink">{s.heading}</h3>
                <p
                  className={`mt-2 t-small text-muted ${wide ? "max-w-[52ch]" : ""}`}
                >
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14">
          <PrimaryCta label={m.common.startCta} location="how_it_works" />
        </div>
      </div>
    </div>
  );
}

function Node({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "glass" | "engine";
}) {
  if (tone === "engine") {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-mint/30 bg-white/5 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse-node" />
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse-node" style={{ animationDelay: "0.3s" }} />
          <span className="h-2 w-2 rounded-full bg-mint animate-pulse-node" style={{ animationDelay: "0.6s" }} />
        </div>
        <span className="font-display text-sm font-bold text-appwhite">{label}</span>
        <span className="t-caption text-appmuted">{sub}</span>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-appmuted">{label}</p>
      <p className="mt-0.5 font-display text-sm font-bold text-appwhite">{sub}</p>
    </div>
  );
}

function Connector({ fan = false }: { fan?: boolean }) {
  return (
    <svg width="120" height="46" viewBox="0 0 120 46" className="my-1" aria-hidden>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#21C7A8" />
        </linearGradient>
      </defs>
      {fan ? (
        <>
          <path d="M60 2 C60 20, 22 22, 22 44" stroke="url(#cg)" strokeWidth="1.5" fill="none" strokeDasharray="4 7" className="animate-dash-flow" />
          <path d="M60 2 L60 44" stroke="url(#cg)" strokeWidth="1.5" fill="none" strokeDasharray="4 7" className="animate-dash-flow" />
          <path d="M60 2 C60 20, 98 22, 98 44" stroke="url(#cg)" strokeWidth="1.5" fill="none" strokeDasharray="4 7" className="animate-dash-flow" />
        </>
      ) : (
        <path d="M60 2 L60 44" stroke="url(#cg)" strokeWidth="1.5" fill="none" strokeDasharray="4 7" className="animate-dash-flow" />
      )}
    </svg>
  );
}
