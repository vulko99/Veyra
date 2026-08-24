import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "Privacy policy — Veyra" };

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy policy"
      intro="This summary explains, in plain language, how Veyra handles your data. It is not a substitute for the full legal policy, which will be published before launch."
    >
      <Section heading="Data minimisation">
        <p>
          We collect only what we need to show you relevant options. We do not
          require an account, and we store request metadata such as IP address
          and device only as one-way hashes — never in raw form.
        </p>
      </Section>
      <Section heading="Consent">
        <p>
          We process and share your data based on the explicit, versioned
          consent you give. Marketing consent is always separate and optional.
          You can decline sharing and simply not proceed.
        </p>
      </Section>
      <Section heading="Sharing with partners">
        <p>
          If you choose to continue to a partner, relevant application details
          are shared with that partner so they can process your enquiry. We only
          share with partners you choose to continue to.
        </p>
      </Section>
      <Section heading="Retention">
        <p>
          We keep personal data only as long as necessary and anonymise records
          past our retention window. An audit trail of key events is maintained
          for accountability.
        </p>
      </Section>
      <Section heading="Your rights">
        <p>
          Subject to applicable law, you may request access to, correction of,
          or deletion of your personal data. Contact us via the contact page.
        </p>
      </Section>
      <p className="text-sm text-slate-500">
        Policy version reference is recorded with each consent you provide.
      </p>
    </PageShell>
  );
}
