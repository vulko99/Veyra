"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { WizardStep } from "@/components/WizardStep";
import type { EmploymentType } from "@/types";

const OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "CONTRACT", label: "Contract" },
  { value: "RETIRED", label: "Retired" },
  { value: "STUDENT", label: "Student" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "OTHER", label: "Other" },
];

export default function EmploymentStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const value = draft.employment_type;

  return (
    <WizardStep
      current="employment"
      title="What is your employment situation?"
      onNext={() => router.push("/apply/debt")}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              value === o.value
                ? "border-accent-500 bg-accent-500/10 text-accent-600"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
            onClick={() => update({ employment_type: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div>
        <label className="field-label" htmlFor="months">
          How many months in your current situation? (optional)
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
