"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import {
  ApiRequestError,
  draftToPayload,
  patchApplication,
  postConsent,
  runMatch,
} from "@/lib/api";

export default function ConsentStep() {
  const router = useRouter();
  const { draft, ensureApplication, clearRemote } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.consent;
  const [platform, setPlatform] = useState(false);
  const [partner, setPartner] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = platform && partner && !submitting;

  // The full submit sequence against one application id.
  async function submitOnce(): Promise<string> {
    const publicId = await ensureApplication();
    if (!publicId) throw new Error("no application");
    // Flush the latest funnel data, record consent, then run matching.
    await patchApplication(publicId, draftToPayload(draft, "consent"));
    await postConsent(publicId, {
      privacy_processing_consent: platform,
      partner_data_sharing_consent: partner,
      marketing_consent: marketing,
    });
    await runMatch(publicId);
    return publicId;
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      let publicId: string;
      try {
        publicId = await submitOnce();
      } catch (e) {
        // A stored application id that no longer exists on the backend (e.g. the
        // DB was reset between sessions) makes every call 404. Recover once by
        // discarding the stale id — keeping the entered data — and starting a
        // fresh application from the same draft.
        if (e instanceof ApiRequestError && e.status === 404) {
          clearRemote();
          publicId = await submitOnce();
        } else {
          throw e;
        }
      }
      router.push(`/results?application=${publicId}`);
    } catch {
      setError(s.error);
      setSubmitting(false);
    }
  }

  return (
    <WizardStep
      current="consent"
      title={s.title}
      subtitle={s.subtitle}
      onNext={handleSubmit}
      nextLabel={submitting ? s.submitting : s.submit}
      nextDisabled={!canSubmit}
    >
      <div className="space-y-3">
        <ConsentRow checked={platform} onChange={setPlatform} required label={s.platformLabel} description={s.platformDesc} />
        <ConsentRow checked={partner} onChange={setPartner} required label={s.partnerLabel} description={s.partnerDesc} />
        <div className="pt-1">
          <ConsentRow checked={marketing} onChange={setMarketing} label={s.marketingLabel} description={s.marketingDesc} optional />
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-appmuted">
        {s.legalPrefix}{" "}
        <Link href="/terms" className="font-medium text-mint-400 hover:underline">
          {s.terms}
        </Link>{" "}
        {s.and}{" "}
        <Link href="/privacy" className="font-medium text-mint-400 hover:underline">
          {s.privacy}
        </Link>
        {s.legalSuffix}
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </WizardStep>
  );
}

function ConsentRow({
  checked,
  onChange,
  label,
  description,
  required = false,
  optional = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  required?: boolean;
  optional?: boolean;
}) {
  const m = useMessages();
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 p-4 a-card ${
        checked ? "a-card-active" : ""
      }`}
    >
      <span
        className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md border-2 transition ${
          checked ? "border-mint bg-mint text-ink" : "border-white/25 bg-transparent text-transparent"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-appwhite">
          {label}
          {required && <span className="ml-1 text-mint-400">*</span>}
          {optional && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-appmuted">
              {m.common.optional}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-appmuted">{description}</span>
      </span>
    </label>
  );
}
