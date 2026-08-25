"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WIZARD_STEPS, prevStep, stepIndex } from "@/lib/wizard";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "./Logo";

type StepSlug = keyof ReturnType<typeof useI18n>["m"]["apply"]["steps"];

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
  const { m, t } = useI18n();
  const idx = stepIndex(current);
  const total = WIZARD_STEPS.length;
  const back = prevStep(current);
  const progress = ((idx + 1) / total) * 100;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-canvas">
      <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-xl flex-col px-5 pb-10 pt-6 sm:pt-10">
        {/* progress header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-muted">
              {t(m.apply.progress, { current: idx + 1, total })}
            </span>
            <span className="font-semibold text-ink">
              {m.apply.steps[current as StepSlug]?.label}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric to-mint transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* content */}
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!nextDisabled) onNext();
          }}
        >
          <div key={current} className="reveal flex-1">
            <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                {subtitle}
              </p>
            )}
            <div className="mt-9">{children}</div>
          </div>

          {/* nav */}
          <div className="sticky bottom-4 mt-10 flex items-center justify-between gap-3">
            {back ? (
              <button
                type="button"
                className="btn-ghost bg-white/80 px-5 py-3 text-sm backdrop-blur"
                onClick={() => router.push(back.path)}
              >
                <span aria-hidden>←</span> {m.common.back}
              </button>
            ) : (
              <Link href="/apply" className="btn-ghost bg-white/80 px-5 py-3 text-sm backdrop-blur">
                <span aria-hidden>←</span> {m.common.back}
              </Link>
            )}
            <button type="submit" className="btn-mint flex-1 sm:flex-none" disabled={nextDisabled}>
              {nextLabel ?? m.common.continue}
              <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Small logo strip shown above the intro screen. */
export function WizardBrand() {
  return (
    <div className="flex justify-center pt-8">
      <Logo />
    </div>
  );
}
