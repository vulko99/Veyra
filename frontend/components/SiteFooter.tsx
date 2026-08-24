"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useMessages } from "@/hooks/useI18n";

export function SiteFooter() {
  const m = useMessages();

  const columns = [
    {
      title: m.footer.productTitle,
      links: [
        { href: "/how-it-works", label: m.footer.links.howItWorks },
        { href: "/loans", label: m.footer.links.loans },
        { href: "/apply", label: m.footer.links.checkOptions },
      ],
    },
    {
      title: m.footer.companyTitle,
      links: [
        { href: "/faq", label: m.footer.links.faq },
        { href: "/contact", label: m.footer.links.contact },
        { href: "/responsible-borrowing", label: m.footer.links.responsible },
      ],
    },
    {
      title: m.footer.legalTitle,
      links: [
        { href: "/privacy", label: m.footer.links.privacy },
        { href: "/terms", label: m.footer.links.terms },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-slate-200 bg-navy-900 text-slate-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            {m.footer.tagline}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-navy-800">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Veyra. {m.footer.rights}</p>
          <p>{m.footer.bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}
