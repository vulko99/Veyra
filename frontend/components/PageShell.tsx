"use client";

import { useEffect } from "react";

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${title} — Veyra`;
    }
  }, [title]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div className="container-x max-w-3xl py-20">
        <div className="reveal">
          <h1 className="t-h1 text-ink">{title}</h1>
          {intro && (
            <p className="mt-6 max-w-2xl t-body text-muted">{intro}</p>
          )}
          <div className="mt-12 space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200/80 pt-7">
      <h2 className="t-h3 text-ink">{heading}</h2>
      <div className="mt-2 t-body text-muted">{children}</div>
    </section>
  );
}
