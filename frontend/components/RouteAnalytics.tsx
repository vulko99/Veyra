"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

/** Fires a page_view on every client-side route change (and the first load).
 *  Only the path is sent — never query strings, which can carry identifiers. */
export function RouteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track("page_view", { path: pathname });
  }, [pathname]);
  return null;
}
