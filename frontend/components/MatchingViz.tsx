"use client";

import { useMessages } from "@/hooks/useI18n";

// Illustrative compatibility scores for the hero demo only — never real terms.
const DEMO_SCORES = [94, 89, 84];

/**
 * The Veyra routing metaphor: a request flows through the matching engine and
 * fans out into ranked options. HTML chips carry the (Cyrillic) labels; an SVG
 * behind them draws animated connectors. Coordinate space is 0..100 × 0..125
 * (portrait 4:5) with preserveAspectRatio="none"; strokes use non-scaling-stroke
 * so line weight stays constant.
 */
export function MatchingViz() {
  const m = useMessages();
  const v = m.home.viz;

  // Node centres in the 0..100 (x) / 0..125 (y) space.
  const req = { x: 50, y: 15 };
  const eng = { x: 50, y: 62 };
  const out = [
    { x: 19, y: 108 },
    { x: 50, y: 112 },
    { x: 81, y: 108 },
  ];

  const pct = (n: { x: number; y: number }) => ({
    left: `${n.x}%`,
    top: `${(n.y / 125) * 100}%`,
  });

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
      {/* soft glow field */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-b from-mint/5 via-electric/5 to-transparent blur-2xl" />

      <svg
        viewBox="0 0 100 125"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#21C7A8" />
          </linearGradient>
        </defs>

        {/* static faint tracks */}
        {[
          `M${req.x} ${req.y} L${eng.x} ${eng.y}`,
          ...out.map((o) => `M${eng.x} ${eng.y} C${eng.x} ${eng.y + 20}, ${o.x} ${o.y - 22}, ${o.x} ${o.y}`),
        ].map((d, i) => (
          <path
            key={`t${i}`}
            d={d}
            fill="none"
            stroke="#0B172A"
            strokeOpacity="0.08"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* animated flowing routes */}
        {[
          `M${req.x} ${req.y} L${eng.x} ${eng.y}`,
          ...out.map((o) => `M${eng.x} ${eng.y} C${eng.x} ${eng.y + 20}, ${o.x} ${o.y - 22}, ${o.x} ${o.y}`),
        ].map((d, i) => (
          <path
            key={`f${i}`}
            d={d}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="6 12"
            vectorEffect="non-scaling-stroke"
            className="animate-dash-flow"
            style={{ animationDelay: `${i * -3}s` }}
          />
        ))}
      </svg>

      {/* Request chip */}
      <Chip style={pct(req)} tone="ink" tall>
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-white/60">
          {v.request}
        </span>
        <span className="mt-0.5 block font-display text-base font-bold text-white">
          {v.requestValue}
        </span>
      </Chip>

      {/* Engine node */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={pct(eng)}
      >
        <div className="relative grid place-items-center">
          <span className="absolute h-24 w-24 rounded-full bg-mint/15 animate-pulse-node" />
          <div className="relative flex flex-col items-center gap-1 rounded-2xl border border-mint/30 bg-white px-4 py-3 shadow-lift">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-electric animate-pulse-node" />
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse-node" style={{ animationDelay: "0.4s" }} />
              <span className="h-2 w-2 rounded-full bg-ink animate-pulse-node" style={{ animationDelay: "0.8s" }} />
            </div>
            <span className="font-display text-[0.82rem] font-bold text-ink">
              {v.engine}
            </span>
            <span className="text-[0.62rem] text-muted">{v.engineNote}</span>
          </div>
        </div>
      </div>

      {/* Match chips — one request fans out into several scored matches. The
          percentages are illustrative demo compatibility, never real terms. */}
      {out.map((o, i) => (
        <Chip key={i} style={pct(o)} tone={i === 0 ? "mint" : "light"}>
          <div className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-md text-[0.7rem] font-bold ${
                i === 0 ? "bg-ink text-mint" : "bg-slate-100 text-ink"
              }`}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[0.72rem] font-semibold text-ink">
                {v.partner} {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[0.64rem] font-bold text-mint-600">
                {DEMO_SCORES[i]}%{" "}
                <span className="font-medium text-muted">{v.compatibility}</span>
              </span>
            </span>
          </div>
        </Chip>
      ))}

      {/* matches caption */}
      <div
        className="absolute left-1/2 w-max -translate-x-1/2"
        style={{ top: "99%" }}
      >
        <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] font-semibold text-white">
          {v.matches}
        </span>
      </div>
    </div>
  );
}

function Chip({
  children,
  style,
  tone = "light",
  tall = false,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
  tone?: "ink" | "mint" | "light";
  tall?: boolean;
}) {
  const toneCls =
    tone === "ink"
      ? "bg-ink border-ink"
      : tone === "mint"
        ? "bg-white border-mint/50 ring-2 ring-mint/25"
        : "bg-white border-slate-200";
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-4 shadow-card ${toneCls} ${
        tall ? "py-3" : "py-2.5"
      }`}
      style={style}
    >
      {children}
    </div>
  );
}
