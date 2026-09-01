"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { defaultLocale, type Locale } from "@/i18n/config";
import { getMessages, interpolate, resolveLocale, type Messages } from "@/i18n";


const LOCALE_STORAGE_KEY = "veyra_locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
  /** Interpolate a template like m.apply.progress with {placeholders}. */
  t: (template: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Honour a previously chosen locale.
  //
  // This runs after paint, which is why a visitor whose stored locale is not
  // the default sees one frame of Bulgarian before it swaps. That is not fixable
  // here: pages are prerendered in the default locale, so applying the stored
  // locale any earlier (useLayoutEffect) changes the tree React is hydrating
  // against and throws a hydration error, which tears down the client tree and
  // takes every other effect with it. Removing the flash for real needs the
  // server to know the locale — locale-prefixed routes, or a cookie with
  // dynamic rendering. Do not "optimise" this into a layout effect.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored) setLocaleState(resolveLocale(stored));
    } catch {
      /* storage may be unavailable; keep default */
    }
  }, []);

  // Keep <html lang> in sync with the active locale.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
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
