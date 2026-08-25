"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatEUR } from "@/lib/format";

const MIN = 200;
const MAX = 15000;
const STEP = 100;
const DEFAULT = 3000;
const PRESETS = [500, 1000, 1500, 3000, 5000];

export default function AmountStep() {
  const router = useRouter();
  const { draft, update, hydrated } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.amount;

  const amount = draft.requested_amount ? parseInt(draft.requested_amount, 10) : DEFAULT;
  const setAmount = (n: number) =>
    update({ requested_amount: String(Math.min(MAX, Math.max(MIN, n))) });

  // Persist the shown default so proceeding without interacting still saves it.
  useEffect(() => {
    if (hydrated && !draft.requested_amount) {
      update({ requested_amount: String(DEFAULT) });
    }
  }, [hydrated, draft.requested_amount, update]);

  const fillPct = ((amount - MIN) / (MAX - MIN)) * 100;

  return (
    <WizardStep
      current="amount"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/term")}
    >
      {/* large amount display */}
      <div className="text-center">
        <div className="font-display text-6xl font-extrabold tracking-tightest text-appwhite tabular-nums sm:text-7xl">
          {formatEUR(amount)}
        </div>
        <p className="mt-2 text-sm text-appmuted">
          {formatEUR(MIN)} – {formatEUR(MAX)}
        </p>
      </div>

      {/* slider */}
      <div className="mt-9">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value, 10))}
          aria-label={s.inputLabel}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-mint
            [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-mint
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lift
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-mint [&::-moz-range-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #21C7A8 ${fillPct}%, #26364B ${fillPct}%)`,
          }}
        />
      </div>

      {/* quick amounts */}
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              amount === p
                ? "border-mint bg-appselect text-mint-400"
                : "border-appborder bg-appsurface text-appwhite hover:border-slate-500"
            }`}
            onClick={() => setAmount(p)}
          >
            {formatEUR(p)}
          </button>
        ))}
      </div>
    </WizardStep>
  );
}
