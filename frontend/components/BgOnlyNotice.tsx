"use client";

import { useI18n } from "@/hooks/useI18n";
import { defaultLocale } from "@/i18n/config";

/**
 * Shown on the `/en` twin of a page whose article text exists only in
 * Bulgarian — the SEO landing pages and the guides.
 *
 * Those twins exist so an English reader following a link keeps English
 * chrome instead of being bounced out of their language, but the prose itself
 * is Bulgarian and pretending otherwise would be worse than saying so. Renders
 * nothing at all on the default locale, where there is nothing to explain.
 */
export function BgOnlyNotice({ className = "" }: { className?: string }) {
  const { locale, m } = useI18n();
  if (locale === defaultLocale) return null;

  return (
    <p
      // The notice itself is in the reader's language, while the article around
      // it is marked `lang="bg"` — so it has to declare its own, or it inherits
      // Bulgarian and gets read aloud with Bulgarian pronunciation.
      lang={locale}
      className={`rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2.5 t-small text-muted ${className}`}
    >
      {m.common.bgOnlyContent}
    </p>
  );
}
