import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDES } from "@/lib/guides-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public, indexable routes. The /apply funnel and /results are intentionally
  // excluded (personal data, transient state).
  const staticPaths: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/how-it-works", priority: 0.8, freq: "monthly" },
    { path: "/krediti", priority: 0.9, freq: "weekly" },
    { path: "/barzi-krediti", priority: 0.9, freq: "weekly" },
    { path: "/kalkulator", priority: 0.8, freq: "monthly" },
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

  const staticEntries = staticPaths.map((p) => ({
    // Home is the bare origin (matches its canonical, no trailing slash).
    url: p.path === "/" ? SITE_URL : `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const guideEntries = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...guideEntries];
}
