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
  // Keep the browser-tab title in sync with the localized page title.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${title} — Veyra`;
    }
  }, [title]);

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>
        {intro && <p className="mt-4 text-lg text-slate-600">{intro}</p>}
        <div className="prose-veyra mt-10 space-y-6 text-slate-700">
          {children}
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
    <section>
      <h2 className="text-xl font-semibold text-navy-900">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
