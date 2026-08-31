"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ApplicationDraft } from "@/types";
import {
  createApplication,
  draftToPayload,
  getApplication,
  patchApplication,
} from "@/lib/api";

const STORAGE_KEY = "veyra_application_draft";
const ID_KEY = "veyra_application_public_id";

interface ApplicationContextValue {
  draft: ApplicationDraft;
  update: (patch: Partial<ApplicationDraft>) => void;
  reset: () => void;
  /** Forget the backend application id (e.g. it 404'd after a DB reset) while
   *  keeping the user's entered draft, so a fresh application can be created. */
  clearRemote: () => void;
  publicId: string | null;
  /** Ensure the application exists on the backend, returning its VY- id. */
  ensureApplication: () => Promise<string | null>;
  hydrated: boolean;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function currentStep(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const m = window.location.pathname.match(/\/apply\/([^/?]+)/);
  return m ? m[1] : undefined;
}

/** Map a fetched Phase 2 application back into the local draft (refresh restore). */
function applicationToDraft(app: Awaited<ReturnType<typeof getApplication>>): ApplicationDraft {
  const a = app.applicant;
  const draft: ApplicationDraft = {};
  if (app.desired_amount_eur) draft.requested_amount = String(parseInt(app.desired_amount_eur, 10));
  if (app.desired_term_months != null) draft.requested_term_months = app.desired_term_months;
  if (a) {
    const name = `${a.first_name} ${a.last_name}`.trim();
    if (name) draft.full_name = name;
    if (a.email) draft.email = a.email;
    if (a.phone) draft.phone = a.phone;
    if (a.monthly_income_eur) draft.monthly_income = String(parseInt(a.monthly_income_eur, 10));
    if (a.employment_status) draft.employment_type = a.employment_status as ApplicationDraft["employment_type"];
    const obligations = a.existing_monthly_obligations_eur;
    if (obligations != null) {
      const num = parseInt(obligations, 10);
      draft.has_existing_loans = num > 0;
      if (num > 0) draft.existing_monthly_payments = String(num);
    }
  }
  return draft;
}

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<ApplicationDraft>({});
  const [publicId, setPublicId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const draftRef = useRef<ApplicationDraft>({});
  const idRef = useRef<string | null>(null);
  const creatingRef = useRef<Promise<string | null> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from storage; restore from backend if a public id exists but the
  // local draft was lost (e.g. cleared storage / another device).
  useEffect(() => {
    const localDraft = read<ApplicationDraft>(STORAGE_KEY, {});
    const storedId = read<string | null>(ID_KEY, null);
    draftRef.current = localDraft;
    idRef.current = storedId;
    setDraft(localDraft);
    setPublicId(storedId);
    setHydrated(true);

    if (storedId && Object.keys(localDraft).length === 0) {
      getApplication(storedId)
        .then((app) => {
          const restored = applicationToDraft(app);
          draftRef.current = restored;
          setDraft(restored);
          persistDraft(restored);
        })
        .catch(() => {
          /* stale id — ignore, user starts fresh */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = (next: ApplicationDraft) => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const storeId = (id: string) => {
    idRef.current = id;
    setPublicId(id);
    try {
      window.sessionStorage.setItem(ID_KEY, JSON.stringify(id));
    } catch {
      /* ignore */
    }
  };

  const ensureApplication = async (): Promise<string | null> => {
    if (idRef.current) return idRef.current;
    if (creatingRef.current) return creatingRef.current;
    const promise = createApplication(draftToPayload(draftRef.current, currentStep()))
      .then((app) => {
        storeId(app.id);
        return app.id;
      })
      .catch(() => null)
      .finally(() => {
        creatingRef.current = null;
      });
    creatingRef.current = promise;
    return promise;
  };

  const syncNow = async () => {
    const id = await ensureApplication();
    if (!id) return;
    try {
      await patchApplication(id, draftToPayload(draftRef.current, currentStep()));
    } catch {
      /* transient; local draft is the safety net */
    }
  };

  const scheduleSync = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void syncNow();
    }, 700);
  };

  const update = (patch: Partial<ApplicationDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      draftRef.current = next;
      persistDraft(next);
      return next;
    });
    scheduleSync();
  };

  const reset = () => {
    setDraft({});
    draftRef.current = {};
    idRef.current = null;
    setPublicId(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(ID_KEY);
    } catch {
      /* ignore */
    }
  };

  // Drop only the backend id (keep the draft). Used to recover from a stale id
  // that no longer exists on the backend (e.g. DB reset between sessions).
  const clearRemote = () => {
    idRef.current = null;
    creatingRef.current = null;
    setPublicId(null);
    try {
      window.sessionStorage.removeItem(ID_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <ApplicationContext.Provider
      value={{ draft, update, reset, clearRemote, publicId, ensureApplication, hydrated }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication(): ApplicationContextValue {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error("useApplication must be used within an ApplicationProvider");
  return ctx;
}
