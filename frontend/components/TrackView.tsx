"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires a single analytics event on mount (tiny client island for otherwise
 *  static server pages). Never pass personal data via props. */
export function TrackView({
  event,
  page,
}: {
  event: AnalyticsEvent;
  page?: string;
}) {
  useEffect(() => {
    track(event, page ? { page } : {});
  }, [event, page]);
  return null;
}
