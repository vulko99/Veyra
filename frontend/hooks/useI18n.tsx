"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { type Locale } from "@/i18n/config";
import { getMessages, interpolate, resolveLocale, type Messages } from "@/i18n";
import { localePath, splitLocale } from "@/lib/locale";

const LOCALE_COOKIE = "veyra_locale";
/** Pre-URL-locale storage key, still read once so an early visitor keeps their choice. */
const LEGACY_STORAGE_KEY = "veyra_locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
  /** Interpolate a template like m.apply.progress with {placeholders}. */
  t: (template: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function writeLocaleCookie(locale: Locale) {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; secure"
      : "";
  // A year, and readable by the edge middleware so a returning visitor lands on
  // the right language from any entry point — a bookmark, a shared link, or the
  // bare domain.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax${secure}`;
}

/**
 * The active locale comes from the URL, which the server already resolved
 * before rendering. There is deliberately no state and no "apply the stored
 * locale" effect here: that effect was what made a visitor whose preference was
 * English see one frame of Bulgarian, because it could only ever run after the
 * page had been painted in whatever language the server guessed. The locale is
 * now part of the address, so there is nothing to correct after the fact.
 */
export function I18nProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // One-time migration for visitors who chose a language before locales moved
  // into the URL. Their preference lived in localStorage, which the middleware
  // cannot read; copy it to the cookie so their *next* entry lands correctly.
  // Deliberately does not navigate — a redirect mid-visit would be a visible
  // hop, and the whole point of this change is to stop the page changing
  // language after it has been painted.
  useEffect(() => {
    try {
      if (document.cookie.includes(`${LOCALE_COOKIE}=`)) return;
      const stored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) writeLocaleCookie(resolveLocale(stored));
    } catch {
      /* storage or cookies unavailable; the URL still decides the language */
    }
  }, []);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    try {
      writeLocaleCookie(next);
    } catch {
      /* preference will not persist, but the navigation below still works */
    }
    const { path } = splitLocale(pathname ?? "/");
    router.push(localePath(next, path));
  };

  const m = getMessages(locale);
  const t = (template: string, values?: Record<string, string | number>) =>
    values ? interpolate(template, values) : template;

  return (
    <I18nContext.Provider value={{ locale, setLocale, m, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Convenience: the active message catalog. */
export function useMessages(): Messages {
  return useI18n().m;
}

/**
 * Prefix an app-internal path with the active locale.
 *
 * Bulgarian paths are returned unchanged, so this is a no-op on the default
 * locale and every existing Bulgarian URL keeps its exact shape.
 */
export function useLocalePath(): (path: string) => string {
  const { locale } = useI18n();
  return (path: string) => localePath(locale, path);
}
