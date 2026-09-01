import { notFound } from "next/navigation";

/**
 * Catch-all that exists purely to hand unmatched URLs to `not-found.tsx`.
 *
 * Without it, no 404 on this site ever reached the site's own 404 page: every
 * unknown path served Next's built-in error page, with no `lang` attribute and
 * English text on a Bulgarian-first site. `[locale]/not-found.tsx` had been
 * written but was unreachable.
 *
 * Two rules combine to cause that. Next only renders a segment's
 * `not-found.tsx` for an explicit `notFound()` call — a URL that simply
 * matches no route is handled by the ROOT `app/not-found.tsx`. And a root
 * not-found cannot exist here, because Next requires it to sit under a root
 * layout, while this app's root layout is `[locale]/layout.tsx` (which is what
 * makes `<html lang>` correct per locale, so it is not moving).
 *
 * Matching the URL and calling `notFound()` ourselves bridges the two: the 404
 * renders inside the locale layout, so it arrives with the site's header,
 * footer and stylesheet, and with the right language.
 *
 * `dynamicParams` is true here and false on the layout. That is deliberate and
 * the values are not in conflict: the layout's false keeps `/xx/faq` from
 * rendering a real page under a bogus locale, while this route has to accept
 * path segments that by definition were never generated. Middleware normalises
 * an unknown locale into the Bulgarian tree before routing, so `/xx/faq`
 * arrives here as `/bg/xx/faq` and is answered by this file too.
 *
 * A catch-all is the lowest-priority match in the App Router, so it cannot
 * shadow a real route: /faq still resolves to faq/page.tsx.
 */
export const dynamicParams = true;

export default function UnmatchedRoute() {
  notFound();
}
