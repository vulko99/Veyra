"use client";

import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";
import type { Messages } from "@/i18n";

type EmpKey = keyof Messages["apply"]["employmentOptions"];

const ORDER: EmpKey[] = [
  "employed",
  "self_employed",
  "business_owner",
  "pensioner",
  "other",
];

const ICON: Record<EmpKey, JSX.Element> = {
  employed: (
    <path d="M7 4h7l4 4v12H7zM14 4v4h4M9.5 13h5M9.5 16h5" />
  ),
  self_employed: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    </>
  ),
  business_owner: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
    </>
  ),
  pensioner: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.5 6.5l1.4 1.4M16.1 16.1l1.4 1.4M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4" />
    </>
  ),
  other: (
    <>
      <circle cx="7" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="17" cy="12" r="1.4" />
    </>
  ),
};

export default function EmploymentStep() {
  const router = useRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.employment;
  const value = draft.employment_type as EmpKey | undefined;

  return (
    <WizardStep
      current="employment"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/debt")}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-2 gap-3">
        {ORDER.map((key, i) => {
          const active = value === key;
          const isLast = i === ORDER.length - 1;
          return (
            <button
              key={key}
              type="button"
              onClick={() => update({ employment_type: key })}
              aria-pressed={active}
              className={`group flex flex-col items-start gap-4 p-5 text-left a-card ${
                active ? "a-card-active" : ""
              } ${isLast && ORDER.length % 2 === 1 ? "col-span-2" : ""}`}
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl transition ${
                  active ? "bg-mint text-ink" : "bg-white/5 text-appwhite"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICON[key]}
                </svg>
              </span>
              <span className="text-[0.95rem] font-semibold text-appwhite">
                {m.apply.employmentOptions[key]}
              </span>
            </button>
          );
        })}
      </div>
    </WizardStep>
  );
}
