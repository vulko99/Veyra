"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";

export default function ApplyIntroPage() {
  const { update } = useApplication();
  const m = useMessages();

  // Capture tracking parameters once on entry.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const patch: Record<string, string> = {};
    (
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const
    ).forEach((k) => {
      const v = params.get(k);
      if (v) patch[k] = v;
    });
    patch.referrer = document.referrer || "";
    patch.landing_page = window.location.pathname;
    if (params.get("utm_source")) patch.source = params.get("utm_source") as string;
    if (params.get("utm_campaign")) patch.campaign = params.get("utm_campaign") as string;
    update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {m.apply.intro.h1}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{m.apply.intro.sub}</p>
        <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
          {m.apply.intro.bullets.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                ✓
              </span>
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link href="/apply/amount" className="btn-accent">
            {m.common.start}
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">{m.common.noGuarantee}</p>
      </div>
    </div>
  );
}
