import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { localizedMetadata } from "@/lib/seo";
import { GUIDES } from "@/lib/guides-content";
import { getMessages, interpolate } from "@/i18n";
import { type Locale } from "@/i18n/config";

export const generateMetadata = localizedMetadata("/guides");

export default function GuidesIndex({
  params,
}: {
  params: { locale: Locale };
}) {
  const m = getMessages(params.locale);

  return (
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div className="container-x max-w-3xl py-16 sm:py-20">
        <header className="reveal max-w-2xl">
          <span className="eyebrow">{m.guides.eyebrow}</span>
          <h1 className="t-h1 mt-4 text-ink">{m.guides.title}</h1>
          <p className="mt-5 t-body text-muted">{m.guides.intro}</p>
        </header>

        <div className="reveal-scroll mt-12 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => {
            const copy = g.copy[params.locale];
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="card-outline group flex flex-col p-6"
              >
                <span className="t-caption text-mint-600">
                  {interpolate(m.guides.readingTime, {
                    minutes: g.readingMinutes,
                  })}
                </span>
                <h2 className="mt-2 font-display text-lg font-bold text-ink group-hover:text-mint-600">
                  {copy.title}
                </h2>
                <p className="mt-2 t-small text-muted">{copy.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
