export interface WizardStep {
  slug: string;
  path: string;
  label: string;
}

// Ordered funnel steps. The consent step is the final gate before results.
export const WIZARD_STEPS: WizardStep[] = [
  { slug: "amount", path: "/apply/amount", label: "Amount" },
  { slug: "term", path: "/apply/term", label: "Term" },
  { slug: "income", path: "/apply/income", label: "Income" },
  { slug: "employment", path: "/apply/employment", label: "Employment" },
  { slug: "debt", path: "/apply/debt", label: "Existing debt" },
  { slug: "contact", path: "/apply/contact", label: "Contact" },
  { slug: "consent", path: "/apply/consent", label: "Consent" },
];

export function stepIndex(slug: string): number {
  return WIZARD_STEPS.findIndex((s) => s.slug === slug);
}

export function nextStep(slug: string): WizardStep | null {
  const i = stepIndex(slug);
  return i >= 0 && i < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[i + 1] : null;
}

export function prevStep(slug: string): WizardStep | null {
  const i = stepIndex(slug);
  return i > 0 ? WIZARD_STEPS[i - 1] : null;
}
