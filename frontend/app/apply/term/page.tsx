"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";

const TERMS = [3, 6, 12, 24, 36, 48];

export default function TermStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.term;
  const term = draft.requested_term_months;
  const valid = !!term && term > 0;

  return (
    <WizardStep
      current="term"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/income")}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-3 gap-3">
        {TERMS.map((tm) => (
          <button
            key={tm}
            type="button"
            className={`rounded-xl border px-4 py-4 text-center transition ${
              term === tm
                ? "border-accent-500 bg-accent-500/10"
                : "border-slate-300 hover:border-slate-400"
            }`}
            onClick={() => update({ requested_term_months: tm })}
          >
            <span className="block text-lg font-semibold text-navy-900">
              {tm}
            </span>
            <span className="text-xs text-slate-500">{s.months}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="field-label" htmlFor="customterm">
          {s.customLabel}
        </label>
        <input
          id="customterm"
          inputMode="numeric"
          className="field-input"
          placeholder="18"
          value={term ?? ""}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
            update({ requested_term_months: Number.isNaN(n) ? undefined : n });
          }}
        />
      </div>
    </WizardStep>
  );
}
