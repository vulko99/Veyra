"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals `.reveal-scroll` sections as they are scrolled to.
 *
 * Renders nothing. Mounted once in the root layout and re-runs per route.
 *
 * Deliberately fail-safe: a section is hidden only after this has run AND
 * found it below the fold. No script, no IntersectionObserver, or reduced
 * motion means nothing is ever hidden, so a page carrying legal disclosures
 * can never end up with content stuck invisible.
 *
 * Sections already on screen at mount are revealed immediately rather than
 * animated, which avoids a flash of hidden content above the fold.
 *
 * IntersectionObserver rather than `animation-timeline: view()`: the CSS
 * feature is Chromium-only, and `CSS.supports()` reports it as available in
 * builds where it does not actually run, so it cannot be feature-detected.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-scroll")
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          // Once the transition is done, strip BOTH classes so the element goes
          // back to being plain markup with no opacity, transform, filter or
          // will-change on it. Removing the hiding class rather than layering
          // an override on top of it means a section cannot be left invisible
          // by anything that interferes with the reveal rule, and it drops the
          // blur's paint cost the moment it stops being needed.
          el.addEventListener(
            "transitionend",
            () => el.classList.remove("reveal-armed", "is-revealed"),
            { once: true }
          );
          observer.unobserve(el);
        }
      },
      // Held back further than a bare intersection: at -8% the section had
      // finished moving before it was properly in view, which is why the
      // effect was barely noticeable. -18% lets the movement happen where it
      // can actually be seen, without arriving so late that it pops.
      { rootMargin: "0px 0px -18% 0px", threshold: 0.05 }
    );

    const armed: HTMLElement[] = [];
    for (const el of sections) {
      const alreadyOnScreen =
        el.getBoundingClientRect().top < window.innerHeight * 0.92;
      // Anything visible at mount is left alone: hiding it to animate it back
      // in is what produces a flash.
      if (alreadyOnScreen) continue;
      el.classList.add("reveal-armed");
      armed.push(el);
      observer.observe(el);
    }

    // Safety net. Feature-detecting IntersectionObserver is not enough: it can
    // be present and still never deliver a callback, and when that happens
    // every armed section stays hidden forever. Content silently disappearing
    // is far worse than a missing animation, so anything still armed after a
    // short grace period is revealed regardless of the observer.
    const failsafe = window.setTimeout(() => {
      for (const el of armed) {
        if (el.classList.contains("reveal-armed")) {
          el.classList.remove("reveal-armed", "is-revealed");
        }
      }
    }, 1600);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
      for (const el of armed) {
        el.classList.remove("reveal-armed", "is-revealed");
      }
    };
  }, [pathname]);

  return null;
}
