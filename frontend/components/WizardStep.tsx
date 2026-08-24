"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WIZARD_STEPS, prevStep, stepIndex } from "@/lib/wizard";
import { useI18n } from "@/hooks/useI18n";

type StepSlug = keyof ReturnType<typeof useI18n>["m"]["apply"]["steps"];

export function WizardProgress({ current }: { current: string }) {
  const { m, t } = useI18n();
  const idx = stepIndex(current);
  const label = m.apply.steps[current as StepSlug]?.label ?? "";
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {t(m.apply.progress, { current: idx + 1, total: WIZARD_STEPS.length })}
        </p>
        <p className="text-sm font-medium text-navy-800">{label}</p>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {WIZARD_STEPS.map((s, i) => (
          <span
            key={s.slug}
            className={`h-1.5 flex-1 rounded-full transition ${
              i <= idx ? "bg-accent-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function WizardStep({
  current,
  title,
  subtitle,
  onNext,
  nextLabel,
  nextDisabled = false,
  children,
}: {
  current: string;
  title: string;
  subtitle?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { m } = useI18n();
  const back = prevStep(current);

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-xl">
        <WizardProgress current={current} />
        <div className="card p-7 sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          <form
            className="mt-7 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nextDisabled) onNext();
            }}
          >
            {children}
            <div className="flex items-center justify-between pt-2">
              {back ? (
                <button
                  type="button"
                  className="btn-ghost px-5 py-2.5 text-sm"
                  onClick={() => router.push(back.path)}
                >
                  {m.common.back}
                </button>
              ) : (
                <Link href="/apply" className="btn-ghost px-5 py-2.5 text-sm">
                  {m.common.back}
                </Link>
              )}
              <button
                type="submit"
                className="btn-accent px-6 py-2.5 text-sm"
                disabled={nextDisabled}
              >
                {nextLabel ?? m.common.continue}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500">
          {m.common.marketplaceShort}
        </p>
      </div>
    </div>
  );
}
