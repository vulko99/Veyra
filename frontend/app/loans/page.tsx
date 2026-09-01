"use client";

import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";
import { PrimaryCta } from "@/components/PrimaryCta";

export default function LoansPage() {
  const m = useMessages();
  return (
    <PageShell title={m.loans.title} intro={m.loans.intro}>
      {/* Two columns leaves an odd-numbered list with an orphan cell, so the
          last card takes the full width when the count is odd. The grid then
          has exactly as many cells as there is content, whatever the catalogue
          length becomes. The wide card also carries a tint, so the group is not
          three identical white boxes. */}
      <div className="grid gap-5 sm:grid-cols-2">
        {m.loans.products.map((p, i) => {
          const wide =
            m.loans.products.length % 2 === 1 &&
            i === m.loans.products.length - 1;
          return (
            <div
              key={p.name}
              className={`card-outline p-6 ${
                wide ? "bg-mint-50/70 sm:col-span-2 sm:p-7" : ""
              }`}
            >
              <h3 className="t-h3 text-ink">{p.name}</h3>
              <p className={`mt-2 t-small text-muted ${wide ? "max-w-[52ch]" : ""}`}>
                {p.body}
              </p>
            </div>
          );
        })}
      </div>
      <Section heading={m.loans.neverTitle}>
        {/* These read as commitments rather than bullet points, so they get
            room and a hairline between them instead of disc markers. */}
        <ul className="divide-y divide-slate-200/80 border-t border-slate-200/80">
          {m.loans.neverList.map((item) => (
            <li key={item} className="py-4 text-ink/80">
              {item}
            </li>
          ))}
        </ul>
      </Section>
      <div className="pt-2">
        <PrimaryCta label={m.common.startCta} location="loans" />
      </div>
    </PageShell>
  );
}
