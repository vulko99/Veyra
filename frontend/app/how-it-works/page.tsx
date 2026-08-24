"use client";

import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function HowItWorksPage() {
  const m = useMessages();
  return (
    <PageShell title={m.howItWorks.title} intro={m.howItWorks.intro}>
      {m.howItWorks.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
      <div className="pt-4">
        <Link href="/apply" className="btn-accent">
          {m.common.checkOptions}
        </Link>
      </div>
    </PageShell>
  );
}
