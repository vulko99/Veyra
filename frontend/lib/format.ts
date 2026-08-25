// Customer-facing amounts are always shown in EUR (€). No BGN/лв.

const eurGroup = new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 0 });

/** €1 500 — euro prefix, grouped thousands. */
export function formatEUR(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "";
  return `€${eurGroup.format(num)}`;
}

export function formatNumber(value: string | number): string {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/\s/g, "")) : value;
  if (Number.isNaN(num)) return "";
  return eurGroup.format(num);
}

/** Keep digits only for numeric money inputs. */
export function parseNumeric(value: string): string {
  return value.replace(/[^\d]/g, "");
}
