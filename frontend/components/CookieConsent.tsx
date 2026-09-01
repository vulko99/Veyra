"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent, subscribeConsent } from "@/lib/consent";
import { useMessages } from "@/hooks/useI18n";

/**
 * Cookie consent gate.
 *
 * Reject is a real, equally prominent, single-click choice — not a link buried
 * under a styled "Accept all". Nothing non-essential loads until a choice is
 * made: see lib/consent.ts for how <Analytics> and track() are gated.
 *
 * Renders nothing until mounted, so the server HTML never contains a banner
 * state that contradicts the visitor's stored decision.
 */
export function CookieConsent() {
  const m = useMessages().cookieBanner;
  const [decided, setDecided] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setDecided(getConsent() !== null);
    sync();
    return subscribeConsent(sync);
  }, []);

  if (decided !== false) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={m.title}
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="container-x">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-lift sm:p-6">
          <h2 className="font-display text-base font-bold text-ink">{m.title}</h2>
          <p className="mt-2 t-small text-muted">
            {m.body}{" "}
            <Link href="/cookies" className="font-medium text-mint-600 hover:underline">
              {m.policyLink}
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            {/* Accept and reject are the same size and weight on purpose. */}
            <button
              type="button"
              onClick={() => setConsent(true)}
              className="btn-mint justify-center"
            >
              {m.accept}
            </button>
            <button
              type="button"
              onClick={() => setConsent(false)}
              className="btn-ghost justify-center"
            >
              {m.reject}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
