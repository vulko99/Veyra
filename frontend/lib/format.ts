export function formatCurrency(value: string | number, currency = "BGN"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value.replace(/\s/g, "")) : value;
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("bg-BG").format(num);
}

export function parseNumeric(value: string): string {
  // Keep digits only for numeric money/term inputs.
  return value.replace(/[^\d.]/g, "");
}
