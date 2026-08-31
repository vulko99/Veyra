import Script from "next/script";

// Loads an analytics provider ONLY when its env var is set at build/deploy time.
// - Google Analytics 4:  NEXT_PUBLIC_GA_ID = "G-XXXXXXX"
// - Plausible (privacy):  NEXT_PUBLIC_PLAUSIBLE_DOMAIN = "veyra.bg"
// Neither set → nothing loads, and track() no-ops. No third-party JS by default.
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

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
