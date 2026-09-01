"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function CookiesPage() {
  const m = useMessages();
  return (
    <PageShell title={m.cookies.title} intro={m.cookies.intro}>
      {m.cookies.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
    </PageShell>
  );
}
