"use client";

import { useEffect, useState } from "react";
import { useMessages } from "@/hooks/useI18n";

export default function FaqPage() {
  const m = useMessages();
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    document.title = `${m.faq.title} — Veyra`;
  }, [m.faq.title]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-60 grid-lines mask-fade-b opacity-50" />
      <div className="container-x max-w-3xl py-20">
        <div className="reveal">
          <span className="eyebrow">FAQ</span>
          <h1 className="t-h1 mt-4 text-ink">{m.faq.title}</h1>
        </div>

        <div className="mt-12 space-y-3">
          {m.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="card-outline overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-base font-bold text-ink">
                    {item.q}
                  </span>
                  <span
                    className={`grid h-6 w-6 flex-none place-items-center rounded-full text-mint-600 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 t-small text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
