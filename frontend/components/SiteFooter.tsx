"use client";

import Link from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useMessages } from "@/hooks/useI18n";
import { CompanyIdentity } from "./CompanyIdentity";

export function SiteFooter() {
  const m = useMessages();
  const pathname = usePathname();
  const f = m.footer;

  // Hidden on the dark application flow (it has its own chrome).
  if (pathname && (pathname.startsWith("/apply") || pathname.startsWith("/results"))) {
    return null;
  }

  const columns = [
    {
      title: f.productTitle,
      links: [
        { href: "/how-it-works", label: f.links.howItWorks },
        { href: "/krediti", label: f.links.loans },
        { href: "/kalkulator", label: f.links.calculator },
        { href: "/guides", label: f.links.guides },
        { href: "/faq", label: f.links.faq },
      ],
    },
    {
      title: f.companyTitle,
      links: [
        { href: "/about", label: f.links.about },
        { href: "/contact", label: f.links.contact },
        { href: "/partners", label: f.links.partners },
      ],
    },
    {
      title: f.legalTitle,
      links: [
        { href: "/privacy", label: f.links.privacy },
        { href: "/terms", label: f.links.terms },
        { href: "/cookies", label: f.links.cookies },
        { href: "/kak-podrezhdame-ofertite", label: f.links.ranking },
      ],
    },
  ];

  return (
    <footer className="mt-28 bg-ink text-slate-300">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light height={30} />
          <p className="mt-4 max-w-[16rem] font-display text-lg font-semibold tracking-tight text-white/90">
            {f.tagline}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300/90 transition hover:text-mint"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Legal identity of the operator — required for trust, for Google Ads
          review (physical address), and for basic consumer protection. */}
      <div className="border-t border-white/10">
        <div className="container-x py-8">
          <CompanyIdentity tone="dark" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Veyra. {f.rights}</p>
          <p>{f.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
