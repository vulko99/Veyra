"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocalePath } from "@/hooks/useI18n";

type Props = ComponentProps<typeof NextLink>;

/**
 * `next/link` that keeps the reader in their language.
 *
 * App-internal paths (`/faq`) are prefixed with the active locale, so the same
 * `href="/faq"` resolves to `/faq` for a Bulgarian reader and `/en/faq` for an
 * English one. On Bulgarian — the default locale — this is a no-op, which is
 * why every existing link in the codebase could keep its literal href.
 *
 * Anything that is not an internal path is passed through untouched: absolute
 * URLs, `mailto:`, `tel:`, and bare `#anchors`.
 *
 * Used in server components too — it is a client leaf, and the locale context
 * lives in the root layout above it.
 */
export default function LocaleLink({ href, ...rest }: Props) {
  const withLocale = useLocalePath();
  const target =
    typeof href === "string" && href.startsWith("/") ? withLocale(href) : href;
  return <NextLink href={target} {...rest} />;
}
