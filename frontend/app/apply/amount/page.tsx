"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

const PRESETS = ["500", "1000", "3000", "5000"];

export default function AmountStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.amount;
  const amount = draft.requested_amount || "";
  const valid = !!amount && parseFloat(amount) > 0;

  return (
    <WizardStep
      current="amount"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/term")}
      nextDisabled={!valid}
    >
      <div>
        <label className="field-label" htmlFor="amount">
          {s.inputLabel}
        </label>
        <input
          id="amount"
          inputMode="numeric"
          className="field-input text-lg"
          placeholder="3000"
          value={amount ? formatNumber(amount) : ""}
          onChange={(e) =>
            update({ requested_amount: parseNumeric(e.target.value) })
          }
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              amount === p
                ? "border-accent-500 bg-accent-500/10 text-accent-600"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
            onClick={() => update({ requested_amount: p })}
          >
            {formatNumber(p)} лв.
          </button>
        ))}
      </div>
    </WizardStep>
  );
}
