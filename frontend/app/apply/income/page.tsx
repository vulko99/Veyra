"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

export default function IncomeStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.income;
  const income = draft.monthly_income || "";
  const valid = !!income && parseFloat(income) >= 0;

  return (
    <WizardStep
      current="income"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/employment")}
      nextDisabled={!valid}
    >
      <div>
        <label className="field-label" htmlFor="income">
          {s.inputLabel}
        </label>
        <input
          id="income"
          inputMode="numeric"
          className="field-input text-lg"
          placeholder="2000"
          value={income ? formatNumber(income) : ""}
          onChange={(e) =>
            update({ monthly_income: parseNumeric(e.target.value) })
          }
        />
      </div>
      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
        {s.hint}
      </p>
    </WizardStep>
  );
}
