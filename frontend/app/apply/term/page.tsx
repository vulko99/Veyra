"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";

const TERMS = [3, 6, 12, 24, 36, 48];
const DEFAULT = 24;

export default function TermStep() {
  const router = useRouter();
  const { draft, update, hydrated } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.term;

  const term = draft.requested_term_months ?? DEFAULT;
  const activeIdx = TERMS.indexOf(term);
  const setTerm = (n: number) => update({ requested_term_months: n });

  useEffect(() => {
    if (hydrated && draft.requested_term_months == null) {
      update({ requested_term_months: DEFAULT });
    }
  }, [hydrated, draft.requested_term_months, update]);

  return (
    <WizardStep
      current="term"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/income")}
    >
      {/* selected value */}
      <div className="text-center">
        <span className="font-display text-6xl font-extrabold tracking-tightest text-ink tabular-nums">
          {term}
        </span>
        <span className="ml-2 text-xl font-semibold text-muted">{s.months}</span>
      </div>

      {/* timeline */}
      <div className="relative mt-12 px-1">
        <div className="absolute left-0 right-0 top-[7px] h-0.5 bg-slate-200" />
        <div
          className="absolute left-0 top-[7px] h-0.5 bg-gradient-to-r from-electric to-mint transition-[width] duration-500"
          style={{
            width: `${activeIdx <= 0 ? 0 : (activeIdx / (TERMS.length - 1)) * 100}%`,
          }}
        />
        <div className="relative flex justify-between">
          {TERMS.map((tm, i) => {
            const done = i <= activeIdx;
            const active = i === activeIdx;
            return (
              <button
                key={tm}
                type="button"
                onClick={() => setTerm(tm)}
                className="flex flex-col items-center gap-3"
                aria-pressed={active}
                aria-label={`${tm} ${s.months}`}
              >
                <span
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    active
                      ? "scale-125 border-mint bg-mint shadow-glow"
                      : done
                        ? "border-mint bg-mint"
                        : "border-slate-300 bg-white"
                  }`}
                />
                <span
                  className={`text-sm font-semibold tabular-nums transition ${
                    active ? "text-ink" : "text-muted"
                  }`}
                >
                  {tm}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-muted">
          {s.months}
        </p>
      </div>
    </WizardStep>
  );
}
