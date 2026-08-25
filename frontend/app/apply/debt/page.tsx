"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

export default function DebtStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.debt;
  const has = draft.has_existing_loans;

  return (
    <WizardStep
      current="debt"
      title={s.title}
      onNext={() => router.push("/apply/contact")}
      nextDisabled={has === undefined}
    >
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: s.no, value: false },
          { label: s.yes, value: true },
        ].map((o) => {
          const active = has === o.value;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => update({ has_existing_loans: o.value })}
              aria-pressed={active}
              className={`flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border text-lg font-bold transition-all ${
                active
                  ? "border-mint bg-mint-50 text-ink ring-1 ring-mint/40"
                  : "border-slate-200 bg-white text-ink hover:border-slate-300 hover:shadow-card"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-sm ${
                  active ? "bg-ink text-mint" : "bg-slate-100 text-muted"
                }`}
              >
                {o.value ? "✓" : "—"}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      {has === true && (
        <div className="reveal mt-8">
          <label htmlFor="payment" className="field-label">
            {s.paymentLabel}
          </label>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-mint focus-within:ring-4 focus-within:ring-mint/15">
            <span className="font-display text-2xl font-bold text-muted">€</span>
            <input
              id="payment"
              inputMode="numeric"
              placeholder="200"
              value={
                draft.existing_monthly_payments
                  ? formatNumber(draft.existing_monthly_payments)
                  : ""
              }
              onChange={(e) =>
                update({ existing_monthly_payments: parseNumeric(e.target.value) })
              }
              className="w-full bg-transparent py-3.5 text-xl font-semibold text-ink outline-none tabular-nums placeholder:text-slate-300"
            />
          </div>
        </div>
      )}
    </WizardStep>
  );
}
