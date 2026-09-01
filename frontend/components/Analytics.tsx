"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent, subscribeConsent } from "@/lib/consent";

// Loads an analytics provider ONLY when BOTH are true:
//   1. its env var is set at build/deploy time
//        - Google Analytics 4: NEXT_PUBLIC_GA_ID = "G-XXXXXXX"
//        - Plausible (privacy): NEXT_PUBLIC_PLAUSIBLE_DOMAIN = "veyra.bg"
//   2. the visitor has actively granted analytics consent.
//
// This is a script gate, not a banner. Before consent the <Script> tags are
// not rendered at all, so no third-party JS is fetched and no cookie is set.
// Do not "simplify" this by rendering the scripts and suppressing events —
// that would defeat the entire point.
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const sync = () => setConsented(hasAnalyticsConsent());
    sync();
    return subscribeConsent(sync);
  }, []);

  if (!consented) return null;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {plausible ? (
        <Script
          src="https://plausible.io/js/script.js"
          data-domain={plausible}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
