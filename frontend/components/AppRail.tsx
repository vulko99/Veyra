"use client";

import { Logo } from "./Logo";
import { WIZARD_STEPS, stepIndex } from "@/lib/wizard";
import { useI18n } from "@/hooks/useI18n";

type StepSlug = keyof ReturnType<typeof useI18n>["m"]["apply"]["steps"];

function useRailItems() {
  const { m } = useI18n();
  const items = WIZARD_STEPS.map((s) => ({
    slug: s.slug,
    label: m.apply.steps[s.slug as StepSlug]?.label ?? s.label,
  }));
  items.push({ slug: "results", label: m.apply.resultsLabel });
  return items;
}

/** Two-digit progress counter, e.g. 01 / 07 (results excluded from the count). */
export function progressCounter(current: string): { current: string; total: string } {
  const idx = stepIndex(current);
  const total = WIZARD_STEPS.length;
  const shown = current === "results" ? total : idx + 1;
  return {
    current: String(shown).padStart(2, "0"),
    total: String(total).padStart(2, "0"),
  };
}

/** Desktop vertical progress rail with the Veyra wordmark. */
export function AppRail({ current }: { current: string }) {
  const items = useRailItems();
  const activeIdx =
    current === "results" ? items.length - 1 : stepIndex(current);

  return (
    <aside className="hidden w-64 flex-none border-r border-white/5 lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-8 py-8">
        <Logo light height={28} />

        <nav className="mt-12 flex-1">
          <ol className="relative">
            {items.map((item, i) => {
              const done = i < activeIdx;
              const active = i === activeIdx;
              const last = i === items.length - 1;
              return (
                <li key={item.slug} className="relative flex items-start gap-3.5 pb-7">
                  {!last && (
                    <span
                      className={`absolute left-[7px] top-4 h-full w-px ${
                        done ? "bg-mint/50" : "bg-white/10"
                      }`}
                    />
                  )}
                  <span className="relative mt-0.5">
                    <span
                      className={`block h-3.5 w-3.5 rounded-full border-2 transition-all ${
                        active
                          ? "border-mint bg-mint shadow-[0_0_0_4px_rgba(33,199,168,0.18)]"
                          : done
                            ? "border-mint bg-mint"
                            : "border-white/25 bg-transparent"
                      }`}
                    />
                    {active && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-mint/40" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium transition ${
                      active
                        ? "text-appwhite"
                        : done
                          ? "text-appmuted"
                          : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
}

/** Mobile compact horizontal progress (segmented). */
export function AppRailMobile({ current }: { current: string }) {
  const items = useRailItems();
  const activeIdx =
    current === "results" ? items.length - 1 : stepIndex(current);
  return (
    <div className="flex gap-1.5 lg:hidden" aria-hidden>
      {items.map((item, i) => (
        <span
          key={item.slug}
          className={`h-1 flex-1 rounded-full transition ${
            i <= activeIdx ? "bg-gradient-to-r from-electric to-mint" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
