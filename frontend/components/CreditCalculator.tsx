"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useMessages } from "@/hooks/useI18n";

const EUR = new Intl.NumberFormat("bg-BG", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const EUR2 = new Intl.NumberFormat("bg-BG", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/** Indicative annuity calculator. Client-only, no dependencies. The result is
 *  an illustration, not an offer — real terms come from a partner. */
export function CreditCalculator() {
  const c = useMessages().calculator;
  const [amount, setAmount] = useState(3000);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(15); // indicative annual interest %
  const started = useRef(false);

  const onInteract = () => {
    if (!started.current) {
      started.current = true;
      track("calculator_started");
    }
    track("calculator_used");
  };

  const { monthly, total, cost } = useMemo(() => {
    const r = rate / 100 / 12;
    const n = months;
    const monthly = r === 0 ? amount / n : (amount * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    return { monthly, total, cost: total - amount };
  }, [amount, months, rate]);

  return (
    <div className="card-outline p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        {/* Inputs */}
        <div className="space-y-7">
          <Field
            label={c.amount}
            value={EUR.format(amount)}
            min={200}
            max={20000}
            step={100}
            raw={amount}
            onChange={setAmount}
            onInteract={onInteract}
          />
          <Field
            label={c.term}
            value={`${months} ${c.months}`}
            min={3}
            max={72}
            step={1}
            raw={months}
            onChange={setMonths}
            onInteract={onInteract}
          />
          <Field
            label={c.rate}
            value={`${rate.toFixed(1)}%`}
            min={0}
            max={50}
            step={0.5}
            raw={rate}
            onChange={setRate}
            onInteract={onInteract}
          />
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-slate-200/80 bg-canvas p-6">
          <p className="t-caption text-muted">{c.monthly}</p>
          <p className="mt-1 font-display text-4xl font-extrabold brand-gradient-text">
            {EUR2.format(monthly)}
          </p>
          <dl className="mt-6 space-y-3 border-t border-slate-200/80 pt-5 text-sm">
            <Row label={c.totalRepay} value={EUR2.format(total)} />
            <Row label={c.totalCost} value={EUR2.format(cost)} strong />
          </dl>
          <Link
            href="/apply"
            className="btn-mint mt-6 w-full justify-center"
            onClick={() => {
              track("calculator_completed", { amount, months });
              track("cta_click", { location: "calculator", amount, months });
            }}
          >
            {c.cta}
            <span aria-hidden>→</span>
          </Link>
          <p className="mt-3 t-caption leading-relaxed text-muted">{c.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  raw,
  min,
  max,
  step,
  onChange,
  onInteract,
}: {
  label: string;
  value: string;
  raw: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onInteract: () => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-ink">{label}</label>
        <span className="font-display text-base font-bold text-ink tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={raw}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onInteract}
        onTouchEnd={onInteract}
        className="mt-3 w-full accent-mint"
        aria-label={label}
      />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-display font-bold text-ink" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
