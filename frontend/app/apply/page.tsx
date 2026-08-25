"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useApplication } from "@/hooks/useApplication";
import { useMessages } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";

export default function ApplyIntroPage() {
  const { update } = useApplication();
  const m = useMessages();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const patch: Record<string, string> = {};
    (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const).forEach((k) => {
      const val = params.get(k);
      if (val) patch[k] = val;
    });
    patch.referrer = document.referrer || "";
    patch.landing_page = window.location.pathname;
    if (params.get("utm_source")) patch.source = params.get("utm_source") as string;
    if (params.get("utm_campaign")) patch.campaign = params.get("utm_campaign") as string;
    update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-canvas">
      <div className="container-x flex min-h-[calc(100vh-68px)] max-w-xl flex-col justify-center py-14 text-center">
        <div className="reveal">
          <div className="mx-auto flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-10 text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">
            {m.apply.intro.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted">
            {m.apply.intro.sub}
          </p>
          <ul className="mx-auto mt-10 max-w-sm space-y-3 text-left">
            {m.apply.intro.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-mint/15 text-xs font-bold text-mint-600">
                  ✓
                </span>
                <span className="text-ink/80">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link href="/apply/amount" className="btn-mint w-full sm:w-auto">
              {m.common.startCta}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted/80">{m.common.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
