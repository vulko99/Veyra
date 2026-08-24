"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { createApplication, runMatching, submitApplication } from "@/lib/api";
import type { ConsentInput } from "@/types";

export default function ConsentStep() {
  const router = useRouter();
  const { draft, setApplicationId } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.consent;
  const [platform, setPlatform] = useState(false);
  const [partner, setPartner] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = platform && partner && !submitting;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const consents: ConsentInput[] = [
        { consent_type: "PLATFORM_PROCESSING", accepted: platform },
        { consent_type: "PARTNER_DATA_TRANSFER", accepted: partner },
        { consent_type: "MARKETING", accepted: marketing },
      ];
      const app = await createApplication(draft, consents);
      setApplicationId(app.id);
      await submitApplication(app.id);
      await runMatching(app.id);
      router.push(`/results?application=${app.id}`);
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
      <ConsentRow
        checked={platform}
        onChange={setPlatform}
        required
        label={s.platformLabel}
        description={s.platformDesc}
      />
      <ConsentRow
        checked={partner}
        onChange={setPartner}
        required
        label={s.partnerLabel}
        description={s.partnerDesc}
      />
      <ConsentRow
        checked={marketing}
        onChange={setMarketing}
        label={s.marketingLabel}
        description={s.marketingDesc}
      />

      <p className="text-xs text-slate-500">
        {s.legalPrefix}{" "}
        <Link href="/terms" className="text-accent-600 hover:underline">
          {s.terms}
        </Link>{" "}
        {s.and}{" "}
        <Link href="/privacy" className="text-accent-600 hover:underline">
          {s.privacy}
        </Link>
        {s.legalSuffix}
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
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
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 flex-none rounded border-slate-300 text-accent-500 focus:ring-accent-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-navy-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}
