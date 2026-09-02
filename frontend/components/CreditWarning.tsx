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
 * CREDIT_WARNING is the statutory wording, mandated in Bulgarian. It must never
 * be moved into the message catalogues — it is not copy to be translated, and
 * keeping it in config/legal.ts is what makes the final text one edit.
 *
 * A locale may supply `legal.warningGloss`: the same warning in the reader's
 * language. Where a gloss exists it REPLACES the Bulgarian rather than leading
 * it, so an English page shows one English sentence and no Bulgarian.
 *
 * That is the owner's decision, taken twice, most recently after reviewing the
 * supplementing version on the live site. It is contested: ЗПК чл. 8, ал. 1
 * puts the requirement on the wording itself, so a translation of it arguably
 * does not discharge it. See the note at the render below before changing this
 * — the question belongs with the ЗПК adviser, not with a code review.
 *
 * `legal.warningGlossNote` ("Statutory wording, binding in Bulgarian") is
 * deliberately still carried in both catalogues. It is unused today and is the
 * label the supplementing version needs, so restoring that version stays a
 * small edit.
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
      {/* ONE line, in the reader's language. A locale supplying
          `legal.warningGloss` shows that INSTEAD of the statutory Bulgarian,
          not alongside it.
          t-body, not t-small: this may never be rendered as fine print.

          ── This is a deliberate owner decision, not an oversight ───────────
          A verification pass flagged it as a defect, and the objection is
          sound: ЗПК чл. 8, ал. 1 places the requirement on the WORDING, so a
          translation of it arguably does not discharge the obligation, and on
          this branch the mandated Bulgarian sentence appears nowhere on an /en
          page. It was implemented as a supplement for exactly that reason —
          English leading, Bulgarian beneath it, labelled by
          `legal.warningGlossNote` — and the owner reviewed that version live
          and chose the single English line instead.

          So: if you are here because a review flagged the missing Bulgarian,
          it has already been flagged and decided. Raise it with the ЗПК
          adviser rather than reverting the code. Restoring the supplement is
          the block removed in commit history — it is a small edit, and
          `warningGlossNote` is still carried in both catalogues for it.
          ─────────────────────────────────────────────────────────────────── */}
      <p className="t-body font-semibold">{m.warningGloss || CREDIT_WARNING}</p>
    </div>
  );
}
