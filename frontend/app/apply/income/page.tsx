"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

export default function IncomeStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const income = draft.monthly_income || "";
  const valid = !!income && parseFloat(income) >= 0;

  return (
    <WizardStep
      current="income"
      title="What is your monthly income?"
      subtitle="Your net monthly income helps us match products with published minimums."
      onNext={() => router.push("/apply/employment")}
      nextDisabled={!valid}
    >
      <div>
        <label className="field-label" htmlFor="income">
          Net monthly income (BGN)
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
        We use this only to check compatibility with partner criteria. It is not
        a credit check.
      </p>
    </WizardStep>
  );
}
