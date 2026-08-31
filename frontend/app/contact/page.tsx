"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";
import { CONTACT_EMAIL, PRIVACY_EMAIL, CONTACT_IS_PLACEHOLDER } from "@/lib/site";

export default function ContactPage() {
  const m = useMessages();
  return (
    <PageShell title={m.contact.title} intro={m.contact.intro}>
      <Section heading={m.contact.generalTitle}>
        <p>
          {m.contact.emailLabel}{" "}
          <a
            className="font-medium text-mint-600 hover:underline"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
      <Section heading={m.contact.dataTitle}>
        <p>
          {m.contact.emailLabel}{" "}
          <a
            className="font-medium text-mint-600 hover:underline"
            href={`mailto:${PRIVACY_EMAIL}`}
          >
            {PRIVACY_EMAIL}
          </a>
        </p>
      </Section>
      {CONTACT_IS_PLACEHOLDER && (
        <p className="text-sm text-muted/80">{m.contact.note}</p>
      )}
    </PageShell>
  );
}
