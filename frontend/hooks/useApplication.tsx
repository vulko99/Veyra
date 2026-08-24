"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ApplicationDraft } from "@/types";

const STORAGE_KEY = "veyra_application_draft";
const ID_KEY = "veyra_application_id";

interface ApplicationContextValue {
  draft: ApplicationDraft;
  update: (patch: Partial<ApplicationDraft>) => void;
  reset: () => void;
  applicationId: string | null;
  setApplicationId: (id: string | null) => void;
  hydrated: boolean;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<ApplicationDraft>({});
  const [applicationId, setApplicationIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(readStorage<ApplicationDraft>(STORAGE_KEY, {}));
    setApplicationIdState(readStorage<string | null>(ID_KEY, null));
    setHydrated(true);
  }, []);

  const persist = (next: ApplicationDraft) => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; ignore */
    }
  };

  const update = (patch: Partial<ApplicationDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setDraft({});
    setApplicationIdState(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(ID_KEY);
    } catch {
      /* ignore */
    }
  };

  const setApplicationId = (id: string | null) => {
    setApplicationIdState(id);
    try {
      if (id) window.sessionStorage.setItem(ID_KEY, JSON.stringify(id));
      else window.sessionStorage.removeItem(ID_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <ApplicationContext.Provider
      value={{ draft, update, reset, applicationId, setApplicationId, hydrated }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication(): ApplicationContextValue {
  const ctx = useContext(ApplicationContext);
  if (!ctx) {
    throw new Error("useApplication must be used within an ApplicationProvider");
  }
  return ctx;
}
