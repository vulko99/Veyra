"use client";

import { PageShell } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function FaqPage() {
  const m = useMessages();
  return (
    <PageShell title={m.faq.title}>
      <div className="space-y-4">
        {m.faq.items.map((item) => (
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
