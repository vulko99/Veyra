#!/usr/bin/env node
/**
 * Build guard for unfilled regulated values.
 *
 * The site deliberately renders [[TODO:*]] placeholders loudly rather than
 * hiding them, so a missing regulated value fails in review instead of
 * shipping as something that looks intentional. This script is the second
 * half of that: it stops a half-filled config reaching PRODUCTION at all.
 *
 * Behaviour is intentionally asymmetric, so the partner-preview deploy keeps
 * working while the values are still being gathered:
 *
 *   production build  -> BLOCKING findings fail the build (exit 1)
 *   any other build   -> everything is reported as a warning (exit 0)
 *
 * "Production" is:
 *   REQUIRE_LEGAL_VALUES = true|1   -> force blocking
 *   REQUIRE_LEGAL_VALUES = false|0  -> force warn-only (escape hatch)
 *   otherwise CONTEXT === "production" (set by Netlify on production deploys)
 *
 * Run standalone with:  npm run check:legal
 * Runs automatically before every build via the "prebuild" script.
 *
 * See TODO-LEGAL.md for what each value is and where it comes from.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// @next/env is CommonJS — import the default and destructure.
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load .env / .env.local exactly as Next does, so values set locally are seen
// here too and the guard does not false-positive.
loadEnvConfig(root, process.env.NODE_ENV !== "production", {
  info: () => {},
  error: console.error,
});

const read = (rel) => {
  try {
    return readFileSync(join(root, rel), "utf8");
  } catch {
    return "";
  }
};

// --- what counts as "still unfilled" ---------------------------------------

const PLACEHOLDER_EMAIL = "@veyra.example";

/** An env-backed value is unfilled if unset, blank, or still a placeholder. */
function envMissing(name) {
  const v = process.env[name];
  return !v || !v.trim() || v.includes("[[TODO:") || v.includes(PLACEHOLDER_EMAIL);
}

/** Distinct [[TODO:NAME]] tokens left in a config file's source. */
function todosIn(rel) {
  return [...new Set(read(rel).match(/\[\[TODO:[A-Z_]+\]\]/g) || [])];
}

const blocking = [];
const warnings = [];

// 1. Company identity — env-backed. TODO-LEGAL.md §1.
const COMPANY_ENV = [
  ["NEXT_PUBLIC_COMPANY_LEGAL_NAME", "Legal entity name"],
  ["NEXT_PUBLIC_COMPANY_EIK", "ЕИК (company number)"],
  ["NEXT_PUBLIC_COMPANY_ADDRESS", "Registered address — also a Google Ads requirement"],
  ["NEXT_PUBLIC_COMPANY_PHONE", "Contact phone"],
  ["NEXT_PUBLIC_CONTACT_EMAIL", "Contact email"],
  ["NEXT_PUBLIC_PRIVACY_EMAIL", "Data-protection email"],
];
for (const [name, label] of COMPANY_ENV) {
  if (envMissing(name)) blocking.push(`${label}  (env ${name})`);
}
// VAT is genuinely optional — the company may not be registered for it. Set it
// to "n/a" to silence this once the position is known.
if (envMissing("NEXT_PUBLIC_COMPANY_VAT")) {
  warnings.push("VAT number unset (env NEXT_PUBLIC_COMPANY_VAT) — set to 'n/a' if not registered");
}

// 2 & 3. Disclosures and the representative example — literals. §2, §3.
for (const token of todosIn("config/disclosures.ts")) {
  blocking.push(`${token}  (config/disclosures.ts)`);
}

// 4. Partner list. §4. Not blocking on its own: the UI states plainly that no
// partners are published, which is honest. But the disclosures describe the
// partner panel, so an empty list means they cannot be truthful either.
if (/PARTNERS:\s*Partner\[\]\s*=\s*\[\s*\]/.test(read("config/partners.ts"))) {
  warnings.push(
    "No partners published (config/partners.ts) — the disclosures describe the partner panel, so they cannot be completed until at least one partner is signed and cleared"
  );
}

// 5. Statutory warning wording. §5.
// Advisory until the Act is in force; blocking from that date, because
// shipping unconfirmed statutory wording once it applies is a real breach.
const ACT_IN_FORCE = new Date("2026-11-20T00:00:00Z");
if (/CREDIT_WARNING_CONFIRMED\s*=\s*false/.test(read("config/legal.ts"))) {
  const msg =
    "Credit-warning wording not confirmed against the published Act " +
    "(config/legal.ts -> CREDIT_WARNING_CONFIRMED). Verify the text, then set it to true";
  if (Date.now() >= ACT_IN_FORCE.getTime()) {
    blocking.push(`${msg} — the Consumer Credit Act is now IN FORCE (20 Nov 2026)`);
  } else {
    warnings.push(`${msg} — required before 20 Nov 2026`);
  }
}

// 7. Domain.
if (envMissing("NEXT_PUBLIC_SITE_URL")) {
  warnings.push(
    "NEXT_PUBLIC_SITE_URL unset — canonical/OG/sitemap URLs fall back to the Netlify build URL"
  );
}

// --- report -----------------------------------------------------------------

const force = (process.env.REQUIRE_LEGAL_VALUES || "").toLowerCase();
const isProduction =
  force === "true" || force === "1"
    ? true
    : force === "false" || force === "0"
      ? false
      : process.env.CONTEXT === "production";

const bar = "─".repeat(72);
const line = (items) => items.map((i) => `  • ${i}`).join("\n");

if (blocking.length || warnings.length) {
  console.error(`\n${bar}`);
  console.error("  UNFILLED REGULATED VALUES");
  console.error(`${bar}`);
  if (blocking.length) {
    console.error(`\n${isProduction ? "BLOCKING" : "Required before production"} (${blocking.length}):`);
    console.error(line(blocking));
  }
  if (warnings.length) {
    console.error(`\nWarnings (${warnings.length}):`);
    console.error(line(warnings));
  }
  console.error(`\n  See TODO-LEGAL.md. None of these may be invented — they are`);
  console.error(`  company identifiers, regulated figures, or third-party names.`);
  console.error(`${bar}\n`);
}

if (isProduction && blocking.length) {
  console.error(
    `Refusing to build for production with ${blocking.length} unfilled regulated value(s).\n` +
      `Supply them, or set REQUIRE_LEGAL_VALUES=false to override deliberately.\n`
  );
  process.exit(1);
}

if (!blocking.length && !warnings.length) {
  console.log("Legal values: all present.");
}
