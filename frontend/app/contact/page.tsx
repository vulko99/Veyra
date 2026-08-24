"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function ContactPage() {
  const m = useMessages();
  return (
    <PageShell title={m.contact.title} intro={m.contact.intro}>
      <div className="card p-6">
        <Section heading={m.contact.generalTitle}>
          <p>
            {m.contact.emailLabel}{" "}
            <a
              className="font-medium text-accent-600 hover:underline"
              href="mailto:hello@veyra.example"
            >
              hello@veyra.example
            </a>
          </p>
        </Section>
        <div className="mt-6">
          <Section heading={m.contact.dataTitle}>
            <p>
              {m.contact.emailLabel}{" "}
              <a
                className="font-medium text-accent-600 hover:underline"
                href="mailto:privacy@veyra.example"
              >
                privacy@veyra.example
              </a>
            </p>
          </Section>
        </div>
      </div>
      <p className="text-sm text-slate-500">{m.contact.note}</p>
    </PageShell>
  );
}
