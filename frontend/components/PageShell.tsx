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
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-60" />
      <div className="container-x max-w-3xl py-20">
        <div className="reveal">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {intro}
            </p>
          )}
          <div className="mt-14 space-y-10">{children}</div>
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
    <section className="border-t border-slate-200/70 pt-8">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">
        {heading}
      </h2>
      <div className="mt-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}
