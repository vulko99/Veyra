"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function AboutPage() {
  const m = useMessages();
  return (
    <PageShell title={m.about.title} intro={m.about.intro}>
      {m.about.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
    </PageShell>
  );
}
