"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";
import { interpolate } from "@/i18n";
import {
  PARTNER_PRIVACY_PROFILES,
  PRIVACY_NOTICE_VERSION,
  LEGAL_REVIEW,
} from "@/config/privacy";

/** Render a value, marking a pending [LEGAL REVIEW REQUIRED] loudly. */
function LegalValue({ value }: { value: string }) {
  if (value === LEGAL_REVIEW) {
    return (
      <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[0.78em] font-semibold text-amber-900">
        {value}
      </mark>
    );
  }
  return <>{value}</>;
}

export default function PrivacyPage() {
  const m = useMessages();
  const p = m.privacy;
  const d = p.partnerDisclosure;

  return (
    <PageShell title={p.title} intro={p.intro}>
      {p.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}

      {/* Partner disclosure — structured, config-driven. Adding a partner is a
          config entry (config/privacy.ts); this section never needs rewriting. */}
      <Section heading={d.heading}>
        <p>{d.intro}</p>
        <div className="mt-5 space-y-4">
          {PARTNER_PRIVACY_PROFILES.map((partner) => (
            <div
              key={partner.name}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{partner.name}</span>
                {partner.demo && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {d.demoLabel}
                  </span>
                )}
                {!partner.verified && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    {d.pendingLabel}
                  </span>
                )}
                <span className="ml-auto text-xs font-medium text-slate-500">
                  {d.egnLabel}: {partner.egnShared ? d.egnYes : d.egnNo}
                </span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <Row label={d.colLegalName} value={partner.legalName} />
                <Row label={d.colRegistration} value={partner.registrationNumber} />
                <Row label={d.colAddress} value={partner.registeredAddress} />
                <Row label={d.colRole} value={partner.recipientRole} />
                <Row label={d.colPrivacy} value={partner.privacyUrl} />
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">{d.notice}</p>
      </Section>

      <p className="text-sm text-slate-500">
        {interpolate(p.versionLabel, { version: PRIVACY_NOTICE_VERSION })}
      </p>
      <p className="text-sm text-slate-500">{p.footNote}</p>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-500">{label}:</dt>
      <dd className="font-medium text-ink">
        <LegalValue value={value} />
      </dd>
    </div>
  );
}
