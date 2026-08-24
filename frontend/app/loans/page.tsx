import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "Loans — Veyra" };

const PRODUCTS = [
  {
    name: "Short-term loans",
    body: "Smaller amounts over shorter periods. Useful for time-sensitive needs where a compact repayment schedule fits.",
  },
  {
    name: "Consumer loans",
    body: "Mid-sized amounts over longer terms, for planned purchases, home improvements, or consolidating what you already owe.",
  },
  {
    name: "Refinancing & consolidation",
    body: "Options that may help you reorganise existing borrowing into a single, clearer arrangement.",
  },
];

export default function LoansPage() {
  return (
    <PageShell
      title="Loan options through our partners"
      intro="Veyra does not lend money. We surface relevant products from our financial partners so you can compare and choose."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="card p-6">
            <h3 className="text-lg font-semibold text-navy-900">{p.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {p.body}
            </p>
          </div>
        ))}
      </div>
      <Section heading="What we never do">
        <ul className="list-disc space-y-2 pl-5">
          <li>We do not guarantee approval or promise a specific rate.</li>
          <li>We do not present partners we are not authorised to display.</li>
          <li>We do not make the final lending decision — the lender does.</li>
        </ul>
      </Section>
      <div className="pt-2">
        <Link href="/apply" className="btn-accent">
          Check your options
        </Link>
      </div>
    </PageShell>
  );
}
