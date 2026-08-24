import { PageShell, Section } from "@/components/PageShell";

export const metadata = { title: "Contact — Veyra" };

export default function ContactPage() {
  return (
    <PageShell
      title="Contact us"
      intro="We are happy to help with questions about how Veyra works or about your data."
    >
      <div className="card p-6">
        <Section heading="General enquiries">
          <p>
            Email:{" "}
            <a
              className="font-medium text-accent-600 hover:underline"
              href="mailto:hello@veyra.example"
            >
              hello@veyra.example
            </a>
          </p>
        </Section>
        <div className="mt-6">
          <Section heading="Data & privacy requests">
            <p>
              Email:{" "}
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
      <p className="text-sm text-slate-500">
        Contact addresses are placeholders for the MVP and will be finalised
        before launch.
      </p>
    </PageShell>
  );
}
