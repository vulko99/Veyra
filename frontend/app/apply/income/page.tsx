"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatNumber, parseNumeric } from "@/lib/format";

const MIN = 0;
const MAX = 10000;
const STEP = 100;

export default function IncomeStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.income;

  const raw = draft.monthly_income ?? "";
  const income = raw ? parseInt(raw, 10) : 0;
  const valid = raw !== "" && income >= 0;
  const fillPct = (Math.min(MAX, income) / MAX) * 100;

  return (
    <WizardStep
      current="income"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/employment")}
      nextDisabled={!valid}
    >
      {/* large € input */}
      <label htmlFor="income" className="sr-only">
        {s.inputLabel}
      </label>
      <div className="flex items-center justify-center gap-1 border-b-2 border-slate-200 pb-3 focus-within:border-mint">
        <span className="font-display text-5xl font-extrabold text-muted sm:text-6xl">
          €
        </span>
        <input
          id="income"
          inputMode="numeric"
          placeholder="2000"
          value={raw ? formatNumber(raw) : ""}
          onChange={(e) => update({ monthly_income: parseNumeric(e.target.value) })}
          className="w-full max-w-[7ch] bg-transparent text-center font-display text-6xl font-extrabold tracking-tightest text-ink outline-none tabular-nums placeholder:text-slate-300 sm:text-7xl"
        />
      </div>

      {/* range viz */}
      <div className="mt-9">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={income}
          onChange={(e) => update({ monthly_income: e.target.value })}
          aria-label={s.inputLabel}
          className="h-2 w-full cursor-pointer appearance-none rounded-full
            [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-mint
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lift
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-mint [&::-moz-range-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #21C7A8 ${fillPct}%, #E2E8F0 ${fillPct}%)`,
          }}
        />
      </div>

      <p className="mt-8 rounded-xl bg-white p-4 text-sm text-muted ring-1 ring-slate-200/70">
        {s.hint}
      </p>
    </WizardStep>
  );
}
