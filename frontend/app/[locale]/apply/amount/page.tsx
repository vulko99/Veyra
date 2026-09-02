"use client";

import { useEffect, useState } from "react";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import { formatEUR } from "@/lib/format";
import { interpolate } from "@/i18n";
import {
  AMOUNT,
  validateAmount,
  snapToStep,
  digitsOnly,
  groupThousands,
} from "@/lib/amount";

const PRESETS = [500, 1000, 1500, 3000, 5000];

export default function AmountStep() {
  const router = useLocaleRouter();
  const { draft, update, hydrated } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.amount;

  const amount = draft.requested_amount
    ? parseInt(draft.requested_amount, 10)
    : AMOUNT.default;

  // Local text mirror of the numeric input so the user can type freely
  // (grouped thousands for display) while the stored value stays numeric.
  const [text, setText] = useState<string>(groupThousands(amount));

  // Store only the raw numeric value — never the formatted string.
  const setAmount = (n: number) => update({ requested_amount: String(n) });

  // Persist the shown default so proceeding without interacting still saves it,
  // and initialise the input text once the draft has hydrated.
  useEffect(() => {
    if (!hydrated) return;
    if (!draft.requested_amount) {
      update({ requested_amount: String(AMOUNT.default) });
      setText(groupThousands(AMOUNT.default));
    } else {
      setText(groupThousands(parseInt(draft.requested_amount, 10)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const error = validateAmount(amount);
  const errorText =
    error === "below_min"
      ? interpolate(s.belowMin, { min: formatEUR(AMOUNT.min) })
      : error === "above_max"
        ? interpolate(s.aboveMax, { max: formatEUR(AMOUNT.max) })
        : error === "invalid_step"
          ? interpolate(s.invalidStep, { step: formatEUR(AMOUNT.step) })
          : error === "invalid"
            ? s.invalid
            : "";

  // Typing in the numeric field: keep only digits, reformat, store the number.
  const onType = (raw: string) => {
    const digits = digitsOnly(raw);
    setText(groupThousands(digits));
    const n = digits ? parseInt(digits, 10) : 0;
    setAmount(n);
  };

  // Slider always yields a valid, stepped value; mirror it into the input.
  const onSlide = (raw: number) => {
    const n = snapToStep(raw);
    setAmount(n);
    setText(groupThousands(n));
  };

  const onPreset = (p: number) => {
    setAmount(p);
    setText(groupThousands(p));
  };

  // Slider position tracks the clamped amount so an out-of-range typed value
  // does not push the thumb past the ends.
  const sliderVal = Math.min(AMOUNT.max, Math.max(AMOUNT.min, amount || AMOUNT.min));
  const fillPct = ((sliderVal - AMOUNT.min) / (AMOUNT.max - AMOUNT.min)) * 100;

  return (
    <WizardStep
      current="amount"
      title={s.title}
      subtitle={s.subtitle}
      // Block advancing on an invalid amount — the backend validates too.
      nextDisabled={!!error}
      onNext={() => router.push("/apply/term")}
    >
      {/* Combined numeric input + slider. Keeps the existing large-figure look,
          but the figure is now editable. */}
      <label htmlFor="amount-input" className="sr-only">
        {s.manualLabel}
      </label>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span
            aria-hidden
            className="font-display text-5xl font-extrabold text-appwhite/70 sm:text-6xl"
          >
            €
          </span>
          <input
            id="amount-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            onChange={(e) => onType(e.target.value)}
            aria-label={s.manualLabel}
            aria-invalid={error ? true : undefined}
            className="w-[min(9ch,70vw)] bg-transparent text-center font-display text-6xl font-extrabold tracking-tightest text-appwhite tabular-nums outline-none focus:text-mint-400 sm:text-7xl"
          />
        </div>
        <p className="mt-2 text-sm text-appmuted">
          {formatEUR(AMOUNT.min)} – {formatEUR(AMOUNT.max)}
        </p>
        {errorText && (
          <p role="alert" className="mt-2 text-sm font-semibold text-red-400">
            {errorText}
          </p>
        )}
      </div>

      {/* slider */}
      <div className="mt-9">
        <input
          type="range"
          min={AMOUNT.min}
          max={AMOUNT.max}
          step={AMOUNT.step}
          value={sliderVal}
          onChange={(e) => onSlide(parseInt(e.target.value, 10))}
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
            onClick={() => onPreset(p)}
          >
            {formatEUR(p)}
          </button>
        ))}
      </div>
    </WizardStep>
  );
}
