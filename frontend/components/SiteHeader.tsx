"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/loans", label: "Loans" },
  { href: "/faq", label: "FAQ" },
  { href: "/responsible-borrowing", label: "Responsible borrowing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/apply" className="btn-accent px-5 py-2 text-sm">
            Check your options
          </Link>
        </nav>
        <button
          type="button"
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/apply" className="btn-accent mt-2" onClick={() => setOpen(false)}>
              Check your options
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
