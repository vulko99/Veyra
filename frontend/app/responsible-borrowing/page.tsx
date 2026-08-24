"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function ResponsibleBorrowingPage() {
  const m = useMessages();
  return (
    <PageShell title={m.responsible.title} intro={m.responsible.intro}>
      {m.responsible.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
    </PageShell>
  );
}
