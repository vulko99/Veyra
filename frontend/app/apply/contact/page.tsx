"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { WizardStep } from "@/components/WizardStep";

const PURPOSES = [
  { value: "MAJOR_PURCHASE", label: "Major purchase" },
  { value: "HOME_IMPROVEMENT", label: "Home improvement" },
  { value: "DEBT_CONSOLIDATION", label: "Consolidate debt" },
  { value: "VEHICLE", label: "Vehicle" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
] as const;

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const email = draft.email || "";
  const emailValid = email === "" || isEmail(email);
  const canContinue = isEmail(email);

  return (
    <WizardStep
      current="contact"
      title="Where should partners reach you?"
      subtitle="We use this to send your options and to pass to a partner only if you choose to continue."
      onNext={() => router.push("/apply/consent")}
      nextDisabled={!canContinue}
    >
      <div>
        <label className="field-label" htmlFor="purpose">
          What is the loan for? (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PURPOSES.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                draft.purpose === p.value
                  ? "border-accent-500 bg-accent-500/10 text-accent-600"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
              onClick={() => update({ purpose: p.value })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          Email
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
          <p className="mt-1.5 text-sm text-red-600">
            Please enter a valid email address.
          </p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="phone">
          Phone (optional)
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
