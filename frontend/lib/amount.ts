// Single source of truth for the loan-amount bounds used by the funnel.
//
// The funnel is EUR-native end to end (backend `desired_amount_eur`,
// `requested_currency="EUR"`). These bounds MUST match the backend's
// independent validation (backend/config/settings/base.py -> AMOUNT_* and
// apps/applications/phase2_serializers.py). Both sides read the same numbers so
// a value accepted by the UI is never rejected by the API and vice versa.
//
// Overridable at build time via NEXT_PUBLIC_AMOUNT_* so a deploy can shift the
// range without code changes — but only alongside the matching backend env.

const toInt = (v: string | undefined, fallback: number): number => {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

export const AMOUNT = {
  min: toInt(process.env.NEXT_PUBLIC_AMOUNT_MIN_EUR, 200),
  max: toInt(process.env.NEXT_PUBLIC_AMOUNT_MAX_EUR, 15000),
  step: toInt(process.env.NEXT_PUBLIC_AMOUNT_STEP_EUR, 100),
  default: toInt(process.env.NEXT_PUBLIC_AMOUNT_DEFAULT_EUR, 3000),
  currency: "EUR" as const,
};

export type AmountError = "below_min" | "above_max" | "invalid_step" | "invalid";

/**
 * Validate a numeric amount against the configured bounds. Returns a stable
 * error code (localised in the UI) or null when valid. Mirrors the backend
 * check exactly — see validate_requested_amount() in the phase2 serializer.
 */
export function validateAmount(value: number | null): AmountError | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return "invalid";
  if (value < AMOUNT.min) return "below_min";
  if (value > AMOUNT.max) return "above_max";
  if ((value - AMOUNT.min) % AMOUNT.step !== 0) return "invalid_step";
  return null;
}

/** Snap a raw value to the nearest valid step within bounds (used by the slider). */
export function snapToStep(value: number): number {
  const clamped = Math.min(AMOUNT.max, Math.max(AMOUNT.min, value));
  const stepped =
    AMOUNT.min + Math.round((clamped - AMOUNT.min) / AMOUNT.step) * AMOUNT.step;
  return Math.min(AMOUNT.max, Math.max(AMOUNT.min, stepped));
}

/** Digits only, no grouping — for parsing what the user typed. */
export function digitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

/** "7500" -> "7 500" (Bulgarian thousands grouping, no currency symbol). */
const group = new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 0 });
export function groupThousands(value: number | string): string {
  const num = typeof value === "string" ? parseInt(digitsOnly(value) || "0", 10) : value;
  if (!Number.isFinite(num)) return "";
  return group.format(num);
}
