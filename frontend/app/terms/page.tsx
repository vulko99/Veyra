import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "Terms of use — Veyra" };

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of use"
      intro="This is a plain-language summary of how Veyra operates. Full legal terms will be published before launch."
    >
      <Section heading="What Veyra is">
        <p>
          Veyra is a financial marketplace. We help you discover relevant
          options from our partners. We are not a lender, we do not provide
          credit, and we do not make lending decisions.
        </p>
      </Section>
      <Section heading="No guarantee">
        <p>
          Showing an option does not mean you will be approved. Approval,
          pricing, and terms are determined solely by the partner.
        </p>
      </Section>
      <Section heading="Your responsibilities">
        <p>
          You agree to provide accurate information and to review any partner
          agreement carefully. Any credit agreement is between you and the
          partner.
        </p>
      </Section>
      <Section heading="Changes">
        <p>
          We may update these terms. The version in force is recorded with each
          consent you provide.
        </p>
      </Section>
    </PageShell>
  );
}
