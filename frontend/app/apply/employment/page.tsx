"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import type { EmploymentType } from "@/types";

const ORDER: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "SELF_EMPLOYED",
  "CONTRACT",
  "RETIRED",
  "STUDENT",
  "UNEMPLOYED",
  "OTHER",
];

export default function EmploymentStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.employment;
  const value = draft.employment_type;

  return (
    <WizardStep
      current="employment"
      title={s.title}
      onNext={() => router.push("/apply/debt")}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-2 gap-3">
        {ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              value === key
                ? "border-accent-500 bg-accent-500/10 text-accent-600"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
            onClick={() => update({ employment_type: key })}
          >
            {m.apply.employmentOptions[key]}
          </button>
        ))}
      </div>
      <div>
        <label className="field-label" htmlFor="months">
          {s.monthsLabel}
        </label>
        <input
          id="months"
          inputMode="numeric"
          className="field-input"
          placeholder="24"
          value={draft.employment_months ?? ""}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
            update({ employment_months: Number.isNaN(n) ? undefined : n });
          }}
        />
      </div>
    </WizardStep>
  );
}
