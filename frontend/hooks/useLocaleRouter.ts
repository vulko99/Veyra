"use client";

import { useRouter } from "next/navigation";
import { useLocalePath } from "@/hooks/useI18n";

/**
 * `useRouter` that keeps the reader in their language.
 *
 * The wizard navigates by literal path (`router.push("/apply/term")`). Those
 * literals are correct for Bulgarian, which is unprefixed, but would drop an
 * English visitor out of `/en` mid-funnel — and the funnel is the one place
 * where switching language halfway through is most disruptive, because the
 * consent and disclosure copy would change under them.
 *
 * Prefixing lives here rather than at each call site so a newly added step
 * cannot forget it.
 */
export function useLocaleRouter() {
  const router = useRouter();
  const withLocale = useLocalePath();

  return {
    push: (path: string) =>
      router.push(path.startsWith("/") ? withLocale(path) : path),
    replace: (path: string) =>
      router.replace(path.startsWith("/") ? withLocale(path) : path),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
    prefetch: (path: string) =>
      router.prefetch(path.startsWith("/") ? withLocale(path) : path),
  };
}
