"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { useMessages } from "@/hooks/useI18n";
import { PrimaryCta } from "./PrimaryCta";

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
        {/* The inline nav appears only once it genuinely fits. Measured at the
            widest locale (Bulgarian): logo 96px + nav 898px = 994px, and the
            container caps content at viewport - 64px, so `lg` (1024px) would
            still be ~34px short and the labels would wrap mid-word. */}
        <nav className="hidden items-center gap-1 min-[1100px]:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <LanguageToggle className="ml-2" />
          <PrimaryCta
            label={m.common.startShort}
            className="btn-mint ml-2 whitespace-nowrap px-5 py-2.5 text-sm"
            location="header"
            arrow={false}
          />
        </nav>
        {/* Mobile: the switcher sits beside the menu button rather than inside
            the panel, so it is reachable without opening the menu first. */}
        <div className="flex items-center gap-2 min-[1100px]:hidden">
          <LanguageToggle />
          <button
            type="button"
            aria-label={m.nav.menu}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink"
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
      </div>

      {open && (
        <nav className="border-t border-slate-200/70 bg-canvas px-5 py-4 min-[1100px]:hidden">
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
            {/* `.btn` is inline-flex, so the full-width look comes from the
                column's default `align-items: stretch`, not the button. That
                is the right tap target on a phone, but the panel now runs up
                to 1100px, where an edge-to-edge pill reads as a banner — so
                above the narrow breakpoint it sizes to its own content. */}
            <PrimaryCta
              label={m.common.startShort}
              className="btn-mint mt-2 min-[480px]:self-start"
              location="header_mobile"
              arrow={false}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </nav>
      )}
    </header>
  );
}
