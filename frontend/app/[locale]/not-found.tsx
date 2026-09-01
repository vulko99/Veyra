import type { Metadata } from "next";
// Plain next/link, not LocaleLink: this renders in Next's error document,
// outside the locale layout, so there is no i18n provider for LocaleLink to
// read and it would throw. Bulgarian is unprefixed, so these hrefs are right.
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страницата не е намерена | Veyra",
  robots: { index: false, follow: true },
};

/**
 * The 404, reached via the `[...unmatched]` catch-all beside this file.
 *
 * Styled inline rather than with the site's utility classes, and that is not a
 * shortcut. Next renders a nested `not-found` inside its own error document
 * (`<html id="__next_error__">`), which does not include the layout — so no
 * stylesheet link is emitted and every Tailwind class on this page would
 * resolve to nothing. Importing globals.css here does not change that; it was
 * tried. The result was a correct but completely unstyled page.
 *
 * The same limitation is why this page has no header, no footer, and no `lang`
 * attribute: all three come from the locale layout, which Next does not run
 * here. Getting them would mean adding a root `app/layout.tsx` that owns
 * `<html>` — and that layout cannot know the locale without reading a request
 * header, which would opt every page in the site out of static generation.
 * Not worth it for the 404, so the page is made self-sufficient instead.
 *
 * Colours and type below are the design tokens' literal values, so if the
 * palette moves this will need updating by hand — the trade for a 404 that
 * looks like the site rather than like a crash.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F7FA",
        color: "#0B172A",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        padding: "2rem 1.25rem",
        textAlign: "center",
        WebkitFontSmoothing: "antialiased",
      }}
      lang="bg"
    >
      <div style={{ maxWidth: "34rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#12A98D",
          }}
        >
          404
        </p>
        <h1
          style={{
            margin: "0.75rem 0 0",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            fontWeight: 700,
          }}
        >
          Страницата не е намерена
        </h1>
        <p
          style={{
            margin: "1rem 0 0",
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "#64748B",
          }}
        >
          Възможно е връзката да е остаряла или страницата да е преместена.
        </p>
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "9999px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "#0B172A",
              backgroundColor: "#21C7A8",
            }}
          >
            Към началото<span aria-hidden>→</span>
          </Link>
          <Link
            href="/kalkulator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "9999px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "#0B172A",
              backgroundColor: "#FFFFFF",
              boxShadow: "inset 0 0 0 1px rgba(11,23,42,0.15)",
            }}
          >
            Кредитен калкулатор
          </Link>
        </div>
      </div>
    </div>
  );
}
