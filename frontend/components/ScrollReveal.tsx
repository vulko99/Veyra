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
 * animated, which avoids a flash of hidden content above the fold. A page
 * whose hero is short enough to leave its first section on screen should give
 * that section the CSS-only `.reveal` entrance instead — see
 * `app/[locale]/responsible-borrowing/page.tsx`.
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

    // Liveness signal for the failsafe below. `observe()` always schedules a
    // first callback per target — intersecting or not — so a callback arriving
    // at all proves the observer is working.
    let observerIsLive = false;

    const observer = new IntersectionObserver(
      (entries) => {
        observerIsLive = true;
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
      // The bottom is held back further than a bare intersection: at -8% the
      // section had finished moving before it was properly in view, which is
      // why the effect was barely noticeable. -18% lets the movement happen
      // where it can actually be seen, without arriving so late that it pops.
      //
      // The top reaches far past the viewport so that "scrolled clean past"
      // still counts as intersecting. A wheel flick, Page Down or an anchor
      // jump can carry a section from below the fold to above the screen
      // between two observations, and with a viewport-sized root no threshold
      // is ever crossed, so no callback arrives and the section stays armed —
      // invisible — for the rest of the visit. Reaching upwards means the
      // observer still fires, just with the section already off the top,
      // where the animation plays unseen and the content simply ends up
      // visible. It cannot make anything reveal early: the bottom edge, which
      // is what a section approaches from, is unchanged.
      { rootMargin: "100000px 0px -18% 0px", threshold: 0.05 }
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
    // is far worse than a missing animation, so if the grace period passes
    // with no sign of life from the observer, everything still armed is
    // revealed regardless of it.
    //
    // Checking liveness rather than only elapsed time is the whole point. An
    // unconditional timeout also strips every section the visitor has not
    // reached yet, which turns the grace period into a deadline on the effect
    // itself: scroll down after it expires and nothing animates, because the
    // sections were disarmed while they were still off screen.
    let failsafe = 0;
    const armFailsafe = () => {
      window.clearTimeout(failsafe);
      // A hidden tab does not run observations at all, so counting that time
      // would disarm the whole page before it is ever looked at. Nothing is
      // visibly missing while hidden either, so the grace period simply
      // restarts whenever the page comes to the front.
      if (document.hidden) return;
      failsafe = window.setTimeout(() => {
        if (observerIsLive) return;
        for (const el of armed) {
          el.classList.remove("reveal-armed", "is-revealed");
        }
      }, 1600);
    };
    document.addEventListener("visibilitychange", armFailsafe);
    armFailsafe();

    // Second safety net, and the one that actually matters.
    //
    // The check above asks whether the observer is alive, and `observerIsLive`
    // is set by the FIRST callback — which `observe()` always delivers for
    // every target, intersecting or not. So it is true within a frame of
    // arming, the timeout above stands down permanently, and an observer that
    // delivers its initial callbacks and then stops tracking scroll leaves
    // every armed section hidden for the rest of the visit. Reproduced: eight
    // sections at opacity 0 with one of them 363px inside the viewport.
    //
    // Liveness was the wrong question. What matters is whether an element is
    // ON SCREEN and still hidden, which needs no observer to answer. This
    // sweeps the armed set on a slow interval and reveals anything the
    // observer should have caught, then stops itself once nothing is left
    // armed — so it costs nothing on a page the visitor has read through.
    //
    // It reveals rather than strips, so the animation still plays: the visitor
    // sees the same entrance, just driven by the sweep instead of the observer.
    const REVEAL_MS = 900; // longer than the 850ms transition
    let sweep = 0;
    const sweepOnce = () => {
      if (document.hidden) return;
      let remaining = 0;
      for (const el of armed) {
        if (!el.classList.contains("reveal-armed")) continue;
        remaining += 1;
        const r = el.getBoundingClientRect();
        const onScreen = r.top < window.innerHeight && r.bottom > 0;
        if (!onScreen) continue;
        if (!el.classList.contains("is-revealed")) {
          el.classList.add("is-revealed");
          // Do not rely on transitionend here: if the environment is not
          // running the transition at all, that event never fires and the
          // element would keep both classes forever. A plain timeout strips
          // them either way, leaving clean markup.
          window.setTimeout(
            () => el.classList.remove("reveal-armed", "is-revealed"),
            REVEAL_MS
          );
        }
      }
      if (remaining === 0) {
        window.clearInterval(sweep);
        sweep = 0;
      }
    };
    sweep = window.setInterval(sweepOnce, 400);

    return () => {
      window.clearTimeout(failsafe);
      window.clearInterval(sweep);
      document.removeEventListener("visibilitychange", armFailsafe);
      observer.disconnect();
      for (const el of armed) {
        el.classList.remove("reveal-armed", "is-revealed");
      }
    };
  }, [pathname]);

  return null;
}
