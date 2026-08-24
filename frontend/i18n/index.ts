import { defaultLocale, isLocale, type Locale } from "./config";
import bg, { type Messages } from "./dictionaries/bg";
import en from "./dictionaries/en";

export type { Messages };
export { defaultLocale, isLocale };
export type { Locale };

const catalogs: Record<Locale, Messages> = { bg, en };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

/** Resolve an unknown string to a supported locale, falling back to default. */
export function resolveLocale(value: string | undefined | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

/** Interpolate {placeholders} in a template string. */
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}
