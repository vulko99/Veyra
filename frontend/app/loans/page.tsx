"use client";

import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function LoansPage() {
  const m = useMessages();
  return (
    <PageShell title={m.loans.title} intro={m.loans.intro}>
      <div className="grid gap-5 sm:grid-cols-2">
        {m.loans.products.map((p) => (
          <div key={p.name} className="card p-6">
            <h3 className="text-lg font-semibold text-navy-900">{p.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {p.body}
            </p>
          </div>
        ))}
      </div>
      <Section heading={m.loans.neverTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {m.loans.neverList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <div className="pt-2">
        <Link href="/apply" className="btn-accent">
          {m.common.checkOptions}
        </Link>
      </div>
    </PageShell>
  );
}
