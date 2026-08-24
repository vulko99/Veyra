"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function PrivacyPage() {
  const m = useMessages();
  return (
    <PageShell title={m.privacy.title} intro={m.privacy.intro}>
      {m.privacy.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
      <p className="text-sm text-slate-500">{m.privacy.footNote}</p>
    </PageShell>
  );
}
