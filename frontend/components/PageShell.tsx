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
    <div className="under-nav relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div className="container-x max-w-3xl py-20">
        <div className="reveal">
          <h1 className="t-h1 text-ink">{title}</h1>
          {/* Short accent rule under the title. These pages have no imagery, so
              the page opening was carrying no weight beyond its type. */}
          <div className="mt-5 h-px w-16 bg-gradient-to-r from-mint to-mint/0" />
          {intro && (
            // A lead, not another paragraph: larger and darker than body copy,
            // so the page has a step down into its sections rather than one
            // uniform grey block from title to footer.
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink/75">
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
    // Capped rather than filling the 3xl shell: lines ran to roughly 90
    // characters, past the point where the eye reliably finds the next line.
    // The value is 52ch, not 65ch, because the CSS `ch` unit is the width of
    // "0" and this face's zero is wider than its average letter, so 65ch
    // measured out at 87 real characters. 52ch lands near 70. The heading also
    // gets real space beneath it so it reads as a heading, not a bold first line.
    // reveal-scroll gives every page built on PageShell the same entrance as
    // the homepage sections: about, partners, contact, cookies, loans, privacy
    // and terms all pick it up from here.
    <section className="reveal-scroll border-t border-slate-200/80 pt-8">
      {/* A clear step above body copy. t-h3 is 1.2rem against a 1rem body,
          which was close enough that headings read as bold first lines. */}
      <h2 className="font-display text-[1.35rem] font-bold tracking-tight text-ink">
        {heading}
      </h2>
      <div className="mt-3 t-body max-w-[52ch] text-muted">{children}</div>
    </section>
  );
}
