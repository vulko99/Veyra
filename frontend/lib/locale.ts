import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";

/**
 * URL shape for locales.
 *
 * Bulgarian is the default and carries NO prefix, so every Bulgarian URL the
 * site has ever had stays exactly as it was — those slugs are the entire SEO
 * surface and must not move. English lives under `/en`.
 *
 *   /faq      -> Bulgarian
 *   /en/faq   -> English
 *
 * The `/bg/...` form exists only as the internal rewrite target (see
 * middleware.ts); it is never a public URL, and a request for one is redirected
 * to the unprefixed path so each page has exactly one address.
 *
 * Deliberately free of imports beyond the locale list: this module is reached
 * from client components (LocaleLink, the i18n provider), so anything it pulls
 * in ships to the browser on every page. The Bulgarian-only path set lives in
 * `lib/bg-only.ts` for exactly that reason.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Split a public pathname into its locale and its canonical (unprefixed) path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (first && isLocale(first)) {
    const joined = `/${rest.join("/")}`;
    const path = joined === "/" ? "/" : joined.replace(/\/$/, "");
    return { locale: first, path };
  }
  return { locale: defaultLocale, path: pathname };
}

/**
 * True for the application funnel and the results page, which run as a distinct
 * dark product experience with their own chrome — the marketing header and
 * footer stand down there.
 *
 * The locale has to be stripped before testing, and both components used to
 * test the raw pathname. That broke in two directions once locales moved into
 * the URL: `/en/apply` does not start with `/apply`, so the marketing chrome
 * rendered over the whole English funnel; and the middleware rewrite means the
 * server sees `/bg/apply` for the Bulgarian page, so the header and footer were
 * server-rendered and then removed on the client. The visible symptom was a
 * strip of page background above the footer, where the dark shell ended and a
 * footer that should not have been there began.
 */
export function isAppFlowPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const { path } = splitLocale(pathname);
  return path.startsWith("/apply") || path.startsWith("/results");
}

export { locales, defaultLocale };
export type { Locale };
