"use client";

import { useI18n } from "@/hooks/useI18n";
import { locales, localeNames } from "@/i18n/config";
import { track } from "@/lib/analytics";

/** Light site chrome vs. the dark application-flow shell. */
type Tone = "light" | "dark";

const TONES: Record<Tone, { group: string; active: string; idle: string }> = {
  light: {
    group: "border-slate-200/80 bg-white/70",
    active: "bg-ink text-white",
    idle: "text-ink/55 hover:bg-white hover:text-ink",
  },
  dark: {
    group: "border-appborder bg-white/5",
    active: "bg-appwhite text-midnight",
    idle: "text-appmuted hover:bg-white/10 hover:text-appwhite",
  },
};

/** Bulgarian/English switcher.
 *
 *  Bulgarian is the primary language; English is the secondary convenience
 *  locale. The choice is persisted per visitor by the I18n provider, so it
 *  carries across pages and into the application flow.
 *
 *  Rendered as two explicit segments rather than a single cycling button: with
 *  only two locales, showing both makes the current one and the alternative
 *  readable at a glance, which matters when the label you can read is the one
 *  you are switching away from.
 */
export function LanguageToggle({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: Tone;
}) {
  const { locale, setLocale, m } = useI18n();
  const t = TONES[tone];

  return (
    <div
      role="group"
      aria-label={m.nav.language}
      className={`inline-flex items-center rounded-full border p-0.5 ${t.group} ${className}`}
    >
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            title={localeNames[code]}
            onClick={() => {
              if (active) return;
              setLocale(code);
              track("language_changed", { locale: code });
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              active ? t.active : t.idle
            }`}
          >
            <span aria-hidden="true">{code}</span>
            {/* Sighted users get the compact code; screen readers get the
                language's own name, which is what the button actually selects. */}
            <span className="sr-only">{localeNames[code]}</span>
          </button>
        );
      })}
    </div>
  );
}
