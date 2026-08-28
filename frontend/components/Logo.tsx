"use client";

import Link from "next/link";
import { useId } from "react";

type Tone = "gradient" | "dark" | "white";

/**
 * Veyra brand mark — a geometric "V" chevron: two converging paths reading as
 * comparison / opportunity / direction. Recognisable without the wordmark and
 * legible at favicon size. The primary mark uses a restrained teal→blue→violet
 * gradient; monochrome variants for dark/light contexts.
 */
export function VeyraMark({
  size = 32,
  tone = "gradient",
  className = "",
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const id = useId();
  const lid = `veyra-l-${id}`;
  const rid = `veyra-r-${id}`;

  // Two facets forming a folded-ribbon "V": teal→blue on the left arm,
  // violet→blue on the right, meeting at a central crease — the brand's
  // colour placement (teal upper-left, violet upper-right, blue at the join).
  const leftFacet = "M7 11 L17 11 L24 27 L24 41 Z";
  const rightFacet = "M24 27 L31 11 L41 11 L24 41 Z";

  if (tone !== "gradient") {
    const solid = tone === "white" ? "#FFFFFF" : "#0B172A";
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} className={className} role="img" aria-label="Veyra">
        <path d={`${leftFacet} ${rightFacet}`} fill={solid} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} role="img" aria-label="Veyra">
      <defs>
        <linearGradient id={lid} x1="7" y1="11" x2="24" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#21C7A8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={rid} x1="41" y1="11" x2="24" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <path d={leftFacet} fill={`url(#${lid})`} />
      <path d={rightFacet} fill={`url(#${rid})`} />
      {/* subtle central crease highlight */}
      <path d="M24 27 L24 41" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="0.8" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Veyra">
      <VeyraMark size={30} tone={light ? "white" : "gradient"} />
      <span
        className={`font-display text-[1.4rem] font-extrabold tracking-tighter ${
          light ? "text-white" : "text-ink"
        }`}
      >
        Veyra
      </span>
    </Link>
  );
}
