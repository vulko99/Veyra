import { LANDINGS } from "@/lib/landing-content";
import { GUIDES } from "@/lib/guides-content";

/**
 * Paths whose *content* exists only in Bulgarian: the SEO landing pages and the
 * guides. Their bodies are Bulgarian prose in `landing-content` /
 * `guides-content`, not entries in a message catalogue, so there is nothing to
 * translate and no English version for a hreflang to point at.
 *
 * Derived from the content itself rather than listed by hand — a new landing
 * page or guide is covered automatically instead of silently claiming an
 * English twin it does not have.
 *
 * Server-side only. It pulls in every landing page and guide, so keep it out of
 * anything a client component can reach; `lib/locale.ts` holds the path helpers
 * that are safe to import from the browser.
 */
export const BG_ONLY_PATHS: ReadonlySet<string> = new Set([
  ...LANDINGS.map((l) => `/${l.slug}`),
  "/guides",
  ...GUIDES.map((g) => `/guides/${g.slug}`),
]);

export function isBgOnlyPath(path: string): boolean {
  return BG_ONLY_PATHS.has(path);
}
