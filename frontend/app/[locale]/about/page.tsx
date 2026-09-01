"use client";

import { PageShell, Section } from "@/components/PageShell";
import { CompanyIdentity } from "@/components/CompanyIdentity";
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

      {/* Who the operator legally is. Required here as well as in the footer:
          a financial services site with no identifiable entity behind it fails
          on trust, on ad review, and on consumer-protection expectations. */}
      <section className="border-t border-slate-200/80 pt-7">
        <CompanyIdentity />
      </section>
    </PageShell>
  );
}
