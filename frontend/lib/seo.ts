import type { Metadata } from "next";

// Single source of truth for the deployed origin. Set NEXT_PUBLIC_SITE_URL to
// the production domain so canonical/OG/sitemap URLs are absolute and correct.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://veyra.bg"
).replace(/\/$/, "");

type Seo = { title: string; description: string };

// Per-path unique title + meta description (Bulgarian, compliance-safe: no
// "guaranteed approval" / "best loan" claims; marketplace framing).
export const PAGE_SEO: Record<string, Seo> = {
  "/how-it-works": {
    title: "Как работи Veyra — сравнение на кредитни възможности",
    description:
      "Попълваш една заявка, Veyra я сравнява с публикуваните критерии на партньорите и показва подходящите възможности. Ти избираш къде да продължиш.",
  },
  "/loans": {
    title: "Видове кредити и възможности | Veyra",
    description:
      "Потребителски, краткосрочни кредити и рефинансиране от нашите партньори. Veyra не е кредитор — сравняваме възможности по въведените от теб критерии.",
  },
  "/faq": {
    title: "Често задавани въпроси | Veyra",
    description:
      "Кредитор ли е Veyra? Защо виждам повече от една възможност? Отговори на въпросите за съответствието, съгласието и как работи маркетплейсът.",
  },
  "/responsible-borrowing": {
    title: "Отговорно кредитиране | Veyra",
    description:
      "Какво да прецениш преди да поемеш кредит: обща цена, месечна вноска, съществуващи задължения и условия на партньора. Практични насоки без заблуда.",
  },
  "/about": {
    title: "За Veyra — финансов маркетплейс",
    description:
      "Veyra е маркетплейс за кредитни възможности. Не отпускаме кредити и не вземаме решения за одобрение — свързваме те с подходящи партньори.",
  },
  "/partners": {
    title: "Партньори | Veyra",
    description:
      "Как Veyra работи с финансови партньори и как се показват подходящите възможности според публикуваните критерии.",
  },
  "/contact": {
    title: "Контакти | Veyra",
    description: "Свържи се с екипа на Veyra.",
  },
  "/cookies": {
    title: "Политика за бисквитки | Veyra",
    description: "Как Veyra използва бисквитки и подобни технологии.",
  },
  "/privacy": {
    title: "Политика за поверителност | Veyra",
    description: "Как Veyra обработва и защитава личните ти данни.",
  },
  "/terms": {
    title: "Общи условия | Veyra",
    description: "Общите условия за ползване на Veyra.",
  },
  "/kalkulator": {
    title: "Кредитен калкулатор — месечна вноска и обща цена | Veyra",
    description:
      "Изчисли ориентировъчна месечна вноска и обща цена на кредит по сума, срок и лихва. Безплатен калкулатор — без заявка и без регистрация.",
  },
  "/krediti": {
    title: "Кредити онлайн — сравни възможности | Veyra",
    description:
      "Една заявка, няколко подходящи възможности за кредит. Veyra сравнява въведените от теб данни с критериите на партньорите. Окончателното решение е на кредитора.",
  },
  "/barzi-krediti": {
    title: "Бързи кредити онлайн — сравни бързи кредити | Veyra",
    description:
      "Сравни бързи кредити от нашите партньори с една заявка. Виж на кои критерии отговаряш и избери сам къде да продължиш. Veyra не е кредитор.",
  },
  "/guides": {
    title: "Полезно за кредити — ръководства | Veyra",
    description:
      "Ясни отговори на въпросите преди да вземеш кредит: ГПР, месечна вноска, ЦКР, обща цена и на какво да обърнеш внимание в договора.",
  },
};

/** Build Next Metadata for a static path from the central SEO config. */
export function buildMetadata(path: string, overrides: Partial<Metadata> = {}): Metadata {
  const seo = PAGE_SEO[path];
  const canonical = path === "/" ? "/" : path;
  return {
    title: seo?.title,
    description: seo?.description,
    alternates: { canonical },
    openGraph: seo
      ? { title: seo.title, description: seo.description, url: `${SITE_URL}${canonical}` }
      : undefined,
    twitter: seo ? { title: seo.title, description: seo.description } : undefined,
    ...overrides,
  };
}

// Routes that must never be indexed (they carry an in-progress application /
// personal data or are transient).
export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};
