"use client";

import { PageShell } from "@/components/PageShell";
import { useMessages } from "@/hooks/useI18n";

export default function FaqPage() {
  const m = useMessages();
  return (
    <PageShell title={m.faq.title}>
      <div className="space-y-4">
        {m.faq.items.map((item) => (
          <details key={item.q} className="surface group p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-ink">
              {item.q}
              <span className="text-mint-600 transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
