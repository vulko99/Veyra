import { PageShell } from "@/components/PageShell";

export const metadata = { title: "FAQ — Veyra" };

const FAQ = [
  {
    q: "Is Veyra a lender?",
    a: "No. Veyra is a marketplace. We connect you with relevant financial partners. We do not lend money and we do not make credit decisions.",
  },
  {
    q: "Does checking my options affect anything?",
    a: "Completing the Veyra application to see relevant options does not itself involve a lender decision. If you choose to continue to a partner, that partner runs its own process.",
  },
  {
    q: "Do you guarantee I will be approved?",
    a: "No. We never guarantee approval and we never promise a specific rate. The options we show are based on the information you provide and each partner's published criteria.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account or password is required to apply. We keep the amount of personal data we collect to a minimum.",
  },
  {
    q: "What does the match score mean?",
    a: "It is an internal compatibility score — how well your request fits a product's published criteria. It is not a credit score and not a probability of approval.",
  },
  {
    q: "How does Veyra make money?",
    a: "When you choose to continue to a partner and are subsequently approved or funded, that partner may pay Veyra a fee. This does not add cost to you.",
  },
];

export default function FaqPage() {
  return (
    <PageShell title="Frequently asked questions">
      <div className="space-y-4">
        {FAQ.map((item) => (
          <details key={item.q} className="card group p-6">
            <summary className="cursor-pointer list-none text-base font-semibold text-navy-900">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
