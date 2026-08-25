import Link from "next/link";

/**
 * Veyra monogram — two paths (ink + mint) converging through a single node
 * into one onward route. Reads as a "V" and as intelligent routing.
 */
export function VeyraMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6.5 L15 19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-ink"
      />
      <path
        d="M26 6.5 L17 19"
        stroke="#21C7A8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* converge node */}
      <circle cx="16" cy="20.4" r="3" fill="#6C63FF" />
      {/* single onward route */}
      <path
        d="M16 22.6 L16 27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-ink"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Veyra"
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          light ? "bg-white/10" : "bg-white shadow-card ring-1 ring-slate-200/70"
        }`}
      >
        <VeyraMark size={24} className={light ? "text-white" : "text-ink"} />
      </span>
      <span
        className={`font-display text-[1.35rem] font-extrabold tracking-tighter ${
          light ? "text-white" : "text-ink"
        }`}
      >
        Veyra
      </span>
    </Link>
  );
}
