"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WIZARD_STEPS, prevStep, stepIndex } from "@/lib/wizard";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "./Logo";
import { AppRail, AppRailMobile, progressCounter } from "./AppRail";

type StepSlug = keyof ReturnType<typeof useI18n>["m"]["apply"]["steps"];

/** Dark full-page shell for the application flow (rail + centered content). */
export function AppShell({
  current,
  children,
  footer,
}: {
  current: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { m } = useI18n();
  const idx = stepIndex(current);
  const total = WIZARD_STEPS.length;
  const counter = progressCounter(current);
  const label =
    current === "results"
      ? m.apply.resultsLabel
      : m.apply.steps[current as StepSlug]?.label ?? "";
  const progress = current === "results" ? 100 : ((idx + 1) / total) * 100;

  return (
    <div className="app-shell">
      <div className="flex">
        <AppRail current={current} />
        <div className="flex min-h-screen flex-1 flex-col">
          {/* top bar */}
          <header className="px-5 pt-6 sm:px-10">
            <div className="flex items-center justify-between">
              <span className="lg:hidden">
                <Logo light />
              </span>
              <span className="hidden text-sm font-medium text-appmuted lg:block">
                {label}
              </span>
              <span className="font-display text-sm font-semibold tabular-nums text-appmuted">
                <span className="text-appwhite">{counter.current}</span> / {counter.total}
              </span>
            </div>
            <div className="mt-4">
              <AppRailMobile current={current} />
              <div className="mt-4 hidden h-px w-full bg-white/10 lg:block">
                <div
                  className="h-px bg-gradient-to-r from-electric to-mint transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col px-5 pb-10 sm:px-10">
            {children}
          </div>

          {footer && <div className="px-5 pb-8 sm:px-10">{footer}</div>}
        </div>
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
    <AppShell current={current}>
      <form
        className="mx-auto flex w-full max-w-xl flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nextDisabled) onNext();
        }}
      >
        <div key={current} className="reveal flex-1 pt-10 sm:pt-16">
          <h1 className="text-[2rem] font-bold leading-[1.05] tracking-tight text-appwhite sm:text-[2.75rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-[0.98rem] leading-relaxed text-appmuted">
              {subtitle}
            </p>
          )}
          <div className="mt-10">{children}</div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-3">
          {back ? (
            <button
              type="button"
              className="a-btn-ghost"
              onClick={() => router.push(back.path)}
            >
              <span aria-hidden>←</span> {m.common.back}
            </button>
          ) : (
            <Link href="/apply" className="a-btn-ghost">
              <span aria-hidden>←</span> {m.common.back}
            </Link>
          )}
          <button
            type="submit"
            className="btn-mint flex-1 sm:flex-none"
            disabled={nextDisabled}
          >
            {nextLabel ?? m.common.continue}
            <span aria-hidden>→</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
