"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";

// Real Veyra lockup (V ribbon + wordmark). Two prepared variants:
//   /veyra-logo.png        dark wordmark — for light surfaces
//   /veyra-logo-white.png  white wordmark — for dark surfaces
// Both share the same intrinsic aspect ratio.
const LOCKUP_RATIO = 1458 / 379;

export function Logo({
  light = false,
  height = 30,
  priority = false,
}: {
  light?: boolean;
  height?: number;
  /**
   * Preload this logo at high priority. Only for a logo that is genuinely
   * above the fold — the site header or the application-flow chrome.
   *
   * Do NOT set it on the footer logo: that emits a high-priority preload for a
   * below-the-fold image on every page and competes with the real LCP element.
   */
  priority?: boolean;
}) {
  const src = light ? "/veyra-logo-white.png" : "/veyra-logo.png";
  const width = Math.round(height * LOCKUP_RATIO);
  return (
    <Link href="/" aria-label="Veyra" className="inline-flex items-center">
      <Image
        src={src}
        alt="Veyra"
        width={width}
        height={height}
        priority={priority}
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}

// Symbol-only mark (the V), for compact/standalone contexts.
export function VeyraSymbol({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/veyra-symbol.png"
      alt="Veyra"
      width={size}
      height={size}
      style={{ height: size, width: "auto" }}
      className={className}
    />
  );
}
