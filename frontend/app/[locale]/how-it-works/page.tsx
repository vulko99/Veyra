"use client";

import Link from "@/components/LocaleLink";
import { useId } from "react";
import { useMessages } from "@/hooks/useI18n";
import { PrimaryCta } from "@/components/PrimaryCta";

export default function HowItWorksPage() {
  const m = useMessages();
  const j = m.home.steps; // reuse the 3-step journey copy
  const viz = m.home.viz;

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

// Geometry of the diagram this connects, in the same units as the viewBox.
// The options below are `grid-cols-3 gap-3` inside a `max-w-lg` column, so the
// legs of the fan have to land on those three column centres — not on
// arbitrary coordinates in a box narrower than the grid, which is why they used
// to stop in mid-air above the gaps between the cards.
const W = 512; // max-w-lg
const GAP = 12; // gap-3
const COL = (W - GAP * 2) / 3;
const CENTRES = [COL / 2, W / 2, W - COL / 2];
const [LEFT, MID, RIGHT] = CENTRES;
const TOP = 2;
const BOTTOM = 44;
const H = 46;

function Connector({ fan = false }: { fan?: boolean }) {
  // Two Connectors render on this page, so the gradient cannot use a fixed id:
  // duplicate ids in one document are invalid and every `url(#…)` resolves to
  // whichever came first.
  //
  // Punctuation is stripped because useId embeds colons, which are legal in an
  // HTML id but not in a CSS selector — so the raw value would work in this
  // `stroke` attribute and then break the moment anyone referenced the gradient
  // from a stylesheet or looked it up with querySelector.
  const gradientId = `cg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // userSpaceOnUse, NOT the default objectBoundingBox. A straight vertical path
  // has a zero-width bounding box, which makes an objectBoundingBox gradient
  // undefined — the browser then paints nothing at all, silently. That is why
  // the request-to-engine line and the centre leg of the fan were missing while
  // the two curved legs (which have width, so a real box) drew fine.
  const stroke = `url(#${gradientId})`;
  const line = {
    stroke,
    strokeWidth: 1.5,
    fill: "none",
    strokeDasharray: "4 7",
    // The x axis stretches to the container while the height stays fixed, so
    // the stroke must opt out of that scaling or it thins out as it widens.
    vectorEffect: "non-scaling-stroke" as const,
    className: "animate-dash-flow",
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="my-1 w-full"
      height={H}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={TOP}
          x2="0"
          y2={BOTTOM}
        >
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#21C7A8" />
        </linearGradient>
      </defs>
      {fan ? (
        <>
          <path
            d={`M${MID} ${TOP} C${MID} ${TOP + 22}, ${LEFT} ${BOTTOM - 24}, ${LEFT} ${BOTTOM}`}
            {...line}
          />
          <path d={`M${MID} ${TOP} L${MID} ${BOTTOM}`} {...line} />
          <path
            d={`M${MID} ${TOP} C${MID} ${TOP + 22}, ${RIGHT} ${BOTTOM - 24}, ${RIGHT} ${BOTTOM}`}
            {...line}
          />
        </>
      ) : (
        <path d={`M${MID} ${TOP} L${MID} ${BOTTOM}`} {...line} />
      )}
    </svg>
  );
}
