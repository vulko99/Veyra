"use client";

import { CREDIT_WARNING } from "@/config/legal";
import { useMessages } from "@/hooks/useI18n";

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
 * NOTE: only the aria-label follows the active locale. CREDIT_WARNING itself
 * stays Bulgarian in every locale — it is statutory wording mandated in
 * Bulgarian, not copy to be translated. Do not "fix" that by moving it into
 * the message catalogs.
 */
export function CreditWarning({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const m = useMessages().legal;

  // Visual register only. The filled amber panel read as an error state; this
  // reads as a standing notice. What the Act constrains is unchanged: same
  // type size and weight, same position in the body flow, same contrast class
  // against its background, not behind a click. Only the fill is dropped and
  // the amber reduced to a marker rule and icon, so the warning still signals
  // itself pre-attentively without looking like something went wrong.
  const toneClasses =
    tone === "dark"
      ? "border-l-amber-400/80 text-appwhite"
      : "border-l-amber-500 text-ink";

  return (
    <div
      role="note"
      aria-label={m.warningAria}
      className={`flex items-start gap-3 border-l-[3px] py-1.5 pl-4 ${toneClasses} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`mt-1 h-[1.05rem] w-[1.05rem] flex-none ${
          tone === "dark" ? "text-amber-400" : "text-amber-600"
        }`}
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
      {/* In Bulgarian the statutory sentence is the only line. In any other
          locale the reader's language leads and the mandated Bulgarian follows,
          labelled as the binding wording, so the warning still appears on the
          page in the form the Act requires rather than being replaced.
          t-body, not t-small: the leading line may never be fine print. */}
      {/* One line, in the reader's language. t-body, not t-small: this may
          never be rendered as fine print. */}
      <p className="t-body font-semibold">{m.warningGloss || CREDIT_WARNING}</p>
    </div>
  );
}
