"use client";

import Link from "next/link";
import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function PartnersPage() {
  const m = useMessages();
  return (
    <PageShell title={m.partners.title} intro={m.partners.intro}>
      {m.partners.sections.map((s) => (
        <Section key={s.heading} heading={s.heading}>
          <p>{s.body}</p>
        </Section>
      ))}
      <div className="pt-2">
        <Link href="/contact" className="btn-primary">
          {m.partners.cta}
        </Link>
      </div>
    </PageShell>
  );
}
