"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApplication } from "@/hooks/useApplication";
import { WizardStep } from "@/components/WizardStep";
import { createApplication, runMatching, submitApplication } from "@/lib/api";
import type { ConsentInput } from "@/types";

export default function ConsentStep() {
  const router = useRouter();
  const { draft, setApplicationId } = useApplication();
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
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <WizardStep
      current="consent"
      title="Your consent"
      subtitle="You decide what you agree to. Nothing is shared with partners unless you choose to continue to one."
      onNext={handleSubmit}
      nextLabel={submitting ? "Finding options…" : "See my options"}
      nextDisabled={!canSubmit}
    >
      <ConsentRow
        checked={platform}
        onChange={setPlatform}
        required
        label="I agree to Veyra processing my information"
        description="So we can show you relevant options. See our privacy policy."
      />
      <ConsentRow
        checked={partner}
        onChange={setPartner}
        required
        label="I agree to my data being shared with a partner I choose to continue to"
        description="Your details are shared only with a partner you actively choose."
      />
      <ConsentRow
        checked={marketing}
        onChange={setMarketing}
        label="I would like to receive occasional updates from Veyra (optional)"
        description="Entirely optional. You can unsubscribe at any time."
      />

      <p className="text-xs text-slate-500">
        By continuing you agree to our{" "}
        <Link href="/terms" className="text-accent-600 hover:underline">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-accent-600 hover:underline">
          privacy policy
        </Link>
        . Veyra does not guarantee approval; the final decision is made by the
        lender.
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
