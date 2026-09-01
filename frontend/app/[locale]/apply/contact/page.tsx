"use client";

import { useLocaleRouter } from "@/hooks/useLocaleRouter";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { WizardStep } from "@/components/WizardStep";

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactStep() {
  const router = useLocaleRouter();
  const { draft, update } = useApplication();
  const m = useMessages();
  const s = m.apply.steps.contact;

  const name = draft.full_name || "";
  const email = draft.email || "";
  const emailValid = email === "" || isEmail(email);
  const canContinue = name.trim().length > 1 && isEmail(email);

  return (
    <WizardStep
      current="contact"
      title={s.title}
      subtitle={s.subtitle}
      onNext={() => router.push("/apply/consent")}
      nextDisabled={!canContinue}
    >
      <div className="space-y-5">
        <div>
          <label className="a-label" htmlFor="name">
            {s.nameLabel}
          </label>
          <input
            id="name"
            className="a-input"
            placeholder={s.namePlaceholder}
            autoComplete="name"
            value={name}
            onChange={(e) => update({ full_name: e.target.value })}
          />
        </div>

        <div>
          <label className="a-label" htmlFor="phone">
            {s.phoneLabel}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            className="a-input"
            placeholder="+359 ..."
            autoComplete="tel"
            value={draft.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>

        <div>
          <label className="a-label" htmlFor="email">
            {s.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            className="a-input"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => update({ email: e.target.value })}
          />
          {!emailValid && (
            <p className="mt-1.5 text-sm text-red-500">{s.emailInvalid}</p>
          )}
        </div>
      </div>
    </WizardStep>
  );
}
