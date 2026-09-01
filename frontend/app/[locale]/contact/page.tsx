"use client";

import { PageShell, Section } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";
import { CONTACT_EMAIL, PRIVACY_EMAIL, CONTACT_IS_PLACEHOLDER } from "@/lib/site";
import { COMPANY } from "@/config/company";
import { HIDE_UNFILLED, isTodo } from "@/config/legal";
import { TodoMark } from "@/components/TodoMark";

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
      {/* Omitted entirely while the number is unfilled and HIDE_UNFILLED is
          set, the same rule CompanyIdentity follows — a "Telephone" heading
          over a red [[TODO:CONTACT_PHONE]] marker is worse than no section.
          This page had `isTodo` without the flag, so the raw token was served
          to visitors on /contact and /en/contact even on builds where every
          other page hid its unfilled values.

          Nothing is invented: with the flag off the marker still shows, and
          `npm run check:legal` still counts the value as outstanding either
          way. */}
      {!(HIDE_UNFILLED && isTodo(COMPANY.phone)) && (
        <Section heading={m.contact.phoneTitle}>
          <p>
            {m.legal.phoneLabel}{" "}
            {isTodo(COMPANY.phone) ? (
              <TodoMark value={COMPANY.phone} />
            ) : (
              <a
                className="font-medium text-mint-600 hover:underline"
                href={`tel:${COMPANY.phone}`}
              >
                {COMPANY.phone}
              </a>
            )}
          </p>
        </Section>
      )}
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
