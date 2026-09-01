import { BgOnlyNotice } from "@/components/BgOnlyNotice";
import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { localizedMetadata } from "@/lib/seo";
import { GUIDES } from "@/lib/guides-content";

export const generateMetadata = localizedMetadata("/guides");

export default function GuidesIndex() {
  return (
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div lang="bg" className="container-x max-w-3xl py-16 sm:py-20">
        <header className="reveal max-w-2xl">
          <BgOnlyNotice className="mb-6" />
          <span className="eyebrow">Полезно</span>
          <h1 className="t-h1 mt-4 text-ink">Ръководства за кредити</h1>
          <p className="mt-5 t-body text-muted">
            Ясни отговори на въпросите, които хората задават преди да вземат кредит —
            без сложни термини и без заблуда.
          </p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="card-outline group flex flex-col p-6"
            >
              <span className="t-caption text-mint-600">{g.readingMinutes} мин четене</span>
              <h2 className="mt-2 font-display text-lg font-bold text-ink group-hover:text-mint-600">
                {g.title}
              </h2>
              <p className="mt-2 t-small text-muted">{g.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
