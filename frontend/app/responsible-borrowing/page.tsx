import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "Responsible borrowing — Veyra" };

export default function ResponsibleBorrowingPage() {
  return (
    <PageShell
      title="Responsible borrowing"
      intro="Borrowing has real costs. We want you to make a decision that is right for your situation."
    >
      <Section heading="Borrow only what you need">
        <p>
          Consider the total cost of borrowing, not just the monthly payment.
          A longer term can lower monthly payments but increase what you pay
          overall.
        </p>
      </Section>
      <Section heading="Check you can afford the repayments">
        <p>
          Look at your income and existing commitments. Make sure repayments fit
          comfortably alongside your essential expenses.
        </p>
      </Section>
      <Section heading="Read the partner's terms">
        <p>
          Any agreement you enter is with the partner, not Veyra. Read their
          terms, interest rate, fees, and conditions carefully before signing.
        </p>
      </Section>
      <Section heading="If you are struggling">
        <p>
          If you are worried about debt, consider speaking with a qualified,
          independent financial adviser or a consumer support organisation
          before taking on new borrowing.
        </p>
      </Section>
    </PageShell>
  );
}
