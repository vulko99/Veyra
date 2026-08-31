"use client";

import Image from "next/image";
import Link from "next/link";

// Real Veyra lockup (V ribbon + wordmark). Two prepared variants:
//   /veyra-logo.png        dark wordmark — for light surfaces
//   /veyra-logo-white.png  white wordmark — for dark surfaces
// Both share the same intrinsic aspect ratio.
const LOCKUP_RATIO = 1458 / 379;

export function Logo({
  light = false,
  height = 30,
}: {
  light?: boolean;
  height?: number;
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
        priority
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
