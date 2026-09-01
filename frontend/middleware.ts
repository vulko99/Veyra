import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing.
 *
 * Every page is prerendered under `/bg/...` and `/en/...`. Bulgarian is served
 * at the unprefixed public URL by rewriting `/faq` to `/bg/faq` internally, so
 * the whole existing Bulgarian URL surface is unchanged while the server still
 * knows, before it renders a single byte, which language to render. That is the
 * point of the exercise: the locale is in the request, so no page is ever
 * painted in the wrong language and then corrected.
 *
 * Deliberately imports only `i18n/config` — nothing that pulls in a message
 * catalogue or the landing copy. This runs on every request at the edge.
 */

const LOCALE_COOKIE = "veyra_locale";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  // `/bg/...` is the internal rewrite target, never a public address. Collapse
  // it so a page cannot be reached at two URLs (and so nothing links to one).
  if (first === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Already addressed in a non-default locale: serve it as it is.
  if (isLocale(first)) return;

  // Unprefixed. A visitor who has actively chosen English is sent to their
  // twin; everyone else gets Bulgarian at the unprefixed URL. Crawlers carry no
  // cookie, so a crawl always sees Bulgarian here — which is what the canonical
  // and the hreflang alternates both claim.
  //
  // 307, not 308: this depends on a request cookie, so it must never be
  // remembered by a browser or treated as the page's permanent address.
  const chosen = req.cookies.get(LOCALE_COOKIE)?.value;
  if (chosen && isLocale(chosen) && chosen !== defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${chosen}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only. Skips Next internals, the API proxy, and anything that looks
  // like a file — which covers /robots.txt, /sitemap.xml and /icon.png, none of
  // which are localized and all of which must keep their exact paths.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
