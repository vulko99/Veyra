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
  const gid = `veyra-${id}`;
  const fill =
    tone === "gradient" ? `url(#${gid})` : tone === "white" ? "#FFFFFF" : "#0B172A";
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Veyra"
    >
      {tone === "gradient" && (
        <defs>
          <linearGradient id={gid} x1="4" y1="8" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#21C7A8" />
            <stop offset="52%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#6C63FF" />
          </linearGradient>
        </defs>
      )}
      {/* solid chevron V (thick, geometric) */}
      <path d="M7 11 L17 11 L24 27 L31 11 L41 11 L24 41 Z" fill={fill} />
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
