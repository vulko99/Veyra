"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

export default function DebtStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const hasLoans = draft.has_existing_loans ?? false;

  return (
    <WizardStep
      current="debt"
      title="Do you have existing loans?"
      subtitle="This helps partners assess affordability. You can skip the amounts if unsure."
      onNext={() => router.push("/apply/contact")}
    >
      <div className="flex gap-3">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              hasLoans === o.value
                ? "border-accent-500 bg-accent-500/10 text-accent-600"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
            onClick={() => update({ has_existing_loans: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>

      {hasLoans && (
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="balance">
              Total outstanding balance (BGN)
            </label>
            <input
              id="balance"
              inputMode="numeric"
              className="field-input"
              placeholder="1500"
              value={
                draft.existing_loan_balance
                  ? formatNumber(draft.existing_loan_balance)
                  : ""
              }
              onChange={(e) =>
                update({ existing_loan_balance: parseNumeric(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="field-label" htmlFor="payments">
              Total monthly repayments (BGN)
            </label>
            <input
              id="payments"
              inputMode="numeric"
              className="field-input"
              placeholder="200"
              value={
                draft.existing_monthly_payments
                  ? formatNumber(draft.existing_monthly_payments)
                  : ""
              }
              onChange={(e) =>
                update({
                  existing_monthly_payments: parseNumeric(e.target.value),
                })
              }
            />
          </div>
        </div>
      )}
    </WizardStep>
  );
}
