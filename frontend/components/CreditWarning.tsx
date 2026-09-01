import { CREDIT_WARNING } from "@/config/legal";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n";

/**
 * The mandatory credit warning.
 *
 * Required on every page that advertises credit under the Bulgarian Consumer
 * Credit Act (in force 20 Nov 2026). Three rules govern how it renders, and
 * all three are deliberate:
 *
 *   1. PROMINENT — placed in the page body, never only in the footer.
 *   2. NOT BEHIND A CLICK — no accordion, modal, tab or "read more".
 *   3. NOT FINE PRINT — `t-body` (1rem / 1.7) and semibold, i.e. at least as
 *      legible as the surrounding copy. Do not shrink this.
 *
 * The wording itself is NOT inlined here: it comes from CREDIT_WARNING in
 * config/legal.ts, so the final statutory text can be corrected in one edit.
 *
 * Deliberately hook-free and context-free, so it renders identically on the
 * server and the client and its text is always present in the server-rendered
 * HTML — which is what ad review and no-JS crawlers see. It reads the default
 * catalog directly for the same reason; revisit if a second locale ships.
 */
export function CreditWarning({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const m = getMessages(defaultLocale).legal;

  const toneClasses =
    tone === "dark"
      ? "border-amber-400/45 border-l-amber-400 bg-amber-400/10 text-amber-50"
      : "border-amber-500/40 border-l-amber-500 bg-amber-50 text-amber-950";

  return (
    <div
      role="note"
      aria-label={m.warningAria}
      className={`flex items-start gap-3 rounded-xl border border-l-4 px-4 py-3.5 ${toneClasses} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 flex-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      {/* t-body, not t-small: this may never be rendered as fine print. */}
      <p className="t-body font-semibold">{CREDIT_WARNING}</p>
    </div>
  );
}
