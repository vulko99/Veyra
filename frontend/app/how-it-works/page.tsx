import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "How it works — Veyra" };

export default function HowItWorksPage() {
  return (
    <PageShell
      title="How Veyra works"
      intro="Veyra is a marketplace that connects you with relevant financial partners. Here is exactly what happens with your information."
    >
      <Section heading="1. You complete one application">
        <p>
          You tell us the amount and term you are considering, along with a few
          details about your situation. No password or account is required, and
          you can go back and edit any step.
        </p>
      </Section>
      <Section heading="2. You give explicit consent">
        <p>
          Before anything is shared, you decide what you agree to. Consent to
          platform processing and to sharing your data with partners is required
          to show you options. Marketing is always separate and optional.
        </p>
      </Section>
      <Section heading="3. Our matching engine finds relevant options">
        <p>
          We compare your information against each partner&apos;s published
          product criteria — such as amount ranges, term ranges, and minimum
          income. This is a compatibility check, not a credit score and not a
          prediction of approval.
        </p>
      </Section>
      <Section heading="4. You choose whether to continue">
        <p>
          You see the options that appear relevant and can continue to a partner
          if you wish. The partner runs its own process and makes the final
          decision. You are never obliged to proceed.
        </p>
      </Section>
      <Section heading="How Veyra makes money">
        <p>
          When you choose to continue to a partner and go on to be approved or
          funded, that partner may pay Veyra a fee. This never changes the
          options we show you or adds cost to you.
        </p>
      </Section>
      <div className="pt-4">
        <Link href="/apply" className="btn-accent">
          Check your options
        </Link>
      </div>
    </PageShell>
  );
}
