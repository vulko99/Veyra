"use client";

import Link from "@/components/LocaleLink";
import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";
import { PartnerList } from "@/components/PartnerList";

export default function PartnersPage() {
  const m = useMessages();
  return (
    <PageShell title={m.partners.title} intro={m.partners.intro}>
      {/* The maintained, named-recipient list the consent step links to. */}
      <PartnerList className="not-prose" />

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
