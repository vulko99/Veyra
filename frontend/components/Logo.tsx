import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          light ? "bg-white text-navy-800" : "bg-navy-800 text-white"
        } font-bold`}
        aria-hidden
      >
        V
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${
          light ? "text-white" : "text-navy-900"
        }`}
      >
        Veyra
      </span>
    </Link>
  );
}
