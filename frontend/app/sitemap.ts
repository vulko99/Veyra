import type { MetadataRoute } from "next";
import { SITE_URL, PAGE_SEO_EN } from "@/lib/seo";
import { GUIDES } from "@/lib/guides-content";
import { LANDINGS } from "@/lib/landing-content";
import { localePath } from "@/lib/locale";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // SEO landing pages are derived from the single content source, so adding a
  // new landing automatically publishes it to the sitemap.
  const landingPaths = LANDINGS.map((l) => ({
    path: `/${l.slug}`,
    priority: 0.9,
    freq: "weekly" as const,
  }));

  // Public, indexable routes. The /apply funnel and /results are intentionally
  // excluded (personal data, transient state).
  const staticPaths: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/how-it-works", priority: 0.8, freq: "monthly" },
    ...landingPaths,
    { path: "/kalkulator", priority: 0.8, freq: "monthly" },
    { path: "/kak-podrezhdame-ofertite", priority: 0.7, freq: "monthly" },
    { path: "/loans", priority: 0.7, freq: "monthly" },
    { path: "/guides", priority: 0.7, freq: "weekly" },
    { path: "/faq", priority: 0.6, freq: "monthly" },
    { path: "/responsible-borrowing", priority: 0.6, freq: "monthly" },
    { path: "/about", priority: 0.4, freq: "monthly" },
    { path: "/partners", priority: 0.4, freq: "monthly" },
    { path: "/contact", priority: 0.3, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "monthly" },
    { path: "/terms", priority: 0.2, freq: "monthly" },
    { path: "/cookies", priority: 0.2, freq: "monthly" },
  ];

  // Home is the bare origin (matches its canonical, no trailing slash).
  const abs = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

  /**
   * A path is listed in English only where an English version genuinely exists
   * — the home page, plus anything with English SEO copy. A path without it is
   * noindex in English (see buildMetadata) and must not appear here: submitting
   * a URL that tells crawlers not to index it is a self-contradiction Search
   * Console reports as an error.
   *
   * Guide articles are the exception to the lookup, not to the rule: their
   * title and description come from their own per-locale copy in
   * `guides-content`, never from PAGE_SEO_EN, so they pass `english` directly.
   */
  const hasEnglish = (path: string) => path === "/" || Boolean(PAGE_SEO_EN[path]);

  const entry = (
    path: string,
    priority: number,
    freq: "weekly" | "monthly",
    english = hasEnglish(path)
  ) => {
    const languages = english
      ? { bg: abs(path), en: abs(localePath("en", path)) }
      : undefined;

    const bg = {
      url: abs(path),
      lastModified: now,
      changeFrequency: freq,
      priority,
      ...(languages ? { alternates: { languages } } : {}),
    };
    if (!languages) return [bg];

    return [
      bg,
      {
        url: abs(localePath("en", path)),
        lastModified: now,
        changeFrequency: freq,
        // English is the secondary locale; keep it below its Bulgarian twin so
        // the Bulgarian URL stays the one crawled first.
        priority: Math.max(0.1, Number((priority - 0.1).toFixed(1))),
        alternates: { languages },
      },
    ];
  };

  const staticEntries = staticPaths.flatMap((p) => entry(p.path, p.priority, p.freq));

  const guideEntries = GUIDES.flatMap((g) =>
    entry(`/guides/${g.slug}`, 0.6, "monthly", true)
  );

  return [...staticEntries, ...guideEntries];
}
