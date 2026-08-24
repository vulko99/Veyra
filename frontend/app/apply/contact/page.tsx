"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import type { Messages } from "@/i18n";

// The purposes surfaced in the funnel (a subset of the full LoanPurpose set).
type PurposeKey = keyof Messages["apply"]["purposeOptions"];

const PURPOSE_ORDER: PurposeKey[] = [
  "MAJOR_PURCHASE",
  "HOME_IMPROVEMENT",
  "DEBT_CONSOLIDATION",
  "VEHICLE",
  "EMERGENCY",
  "OTHER",
];

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.contact;
  const email = draft.email || "";
  const emailValid = email === "" || isEmail(email);
  const canContinue = isEmail(email);

  return (
    <WizardStep
      current="contact"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/consent")}
      nextDisabled={!canContinue}
    >
      <div>
        <label className="field-label">{s.purposeLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          {PURPOSE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                draft.purpose === key
                  ? "border-accent-500 bg-accent-500/10 text-accent-600"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
              onClick={() => update({ purpose: key })}
            >
              {m.apply.purposeOptions[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          {s.emailLabel}
        </label>
        <input
          id="email"
          type="email"
          className="field-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => update({ email: e.target.value })}
        />
        {!emailValid && (
          <p className="mt-1.5 text-sm text-red-600">{s.emailInvalid}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="phone">
          {s.phoneLabel}
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          className="field-input"
          placeholder="+359 ..."
          value={draft.phone || ""}
          onChange={(e) => update({ phone: e.target.value })}
        />
      </div>
    </WizardStep>
  );
}
