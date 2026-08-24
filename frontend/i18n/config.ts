// Locale configuration. Bulgarian is the default/primary locale for the MVP;
// English is fully prepared for future expansion.
export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bg";

export const localeNames: Record<Locale, string> = {
  bg: "Български",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
