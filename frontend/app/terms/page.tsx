"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function TermsPage() {
  const m = useMessages();
  return (
    <PageShell title={m.terms.title} intro={m.terms.intro}>
      {m.terms.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
    </PageShell>
  );
}
