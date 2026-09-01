"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useMessages } from "@/hooks/useI18n";
import { track } from "@/lib/analytics";

// The application flow is a distinct dark product experience with its own chrome.
function isAppFlow(pathname: string | null): boolean {
  return !!pathname && (pathname.startsWith("/apply") || pathname.startsWith("/results"));
}

export function SiteHeader() {
  const m = useMessages();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "/how-it-works", label: m.nav.howItWorks },
    { href: "/krediti", label: m.nav.loans },
    { href: "/kalkulator", label: m.nav.calculator },
    { href: "/faq", label: m.nav.faq },
    { href: "/responsible-borrowing", label: m.nav.responsible },
  ];

  if (isAppFlow(pathname)) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-canvas/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between">
        <Logo priority />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="btn-mint ml-2 px-5 py-2.5 text-sm"
            onClick={() => track("cta_click", { location: "header" })}
          >
            {m.common.startShort}
          </Link>
        </nav>
        <button
          type="button"
          aria-label={m.nav.menu}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200/70 bg-canvas px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/apply" className="btn-mint mt-2" onClick={() => setOpen(false)}>
              {m.common.startShort}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
