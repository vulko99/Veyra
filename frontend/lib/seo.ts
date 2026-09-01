import type { Metadata } from "next";

// Single source of truth for the deployed origin. Everything absolute —
// canonical tags, OG URLs, sitemap entries, robots — derives from this one
// value, so moving to a custom domain is an environment change, not a code
// change. The target domain is deliberately NOT hardcoded: advertising a
// domain that does not exist yet points crawlers at a dead host.
//
// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL — the production domain, set at deploy time.
//   2. URL — injected by Netlify at build time (the site's primary URL), so a
//      preview or *.netlify.app deploy describes itself honestly instead of
//      claiming to be the production domain.
//   3. localhost — local development only.
//
// Server-only: every consumer of SITE_URL renders on the server, which is what
// makes the non-NEXT_PUBLIC fallback safe. Keep it that way.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000"
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
  "/kak-podrezhdame-ofertite": {
    title: "Как подреждаме офертите | Veyra",
    description:
      "По какви параметри Veyra подрежда показаните възможности, влияят ли търговските договорки върху реда и как печелим. Пълна прозрачност на класирането.",
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
  "/kredit-online": {
    title: "Кредит онлайн — кандидатствай с една заявка | Veyra",
    description:
      "Кандидатствай за кредит онлайн с една заявка. Veyra сравнява въведените данни с критериите на партньорите и показва подходящите възможности. Veyra не е кредитор.",
  },
  "/kredit-s-losho-ckr": {
    title: "Кредит при лошо ЦКР — какво е важно да знаеш | Veyra",
    description:
      "Какво е ЦКР и как влияе при кандидатстване за кредит. Veyra не гарантира одобрение — сравняваме въведените данни с публикуваните критерии на партньорите.",
  },
  "/kredit-do-zaplata": {
    title: "Кредит до заплата — кратък срок, внимателна преценка | Veyra",
    description:
      "Кредит до заплата: малки суми за кратък период. Виж на какво да обърнеш внимание и сравни възможности. Veyra не е кредитор и не гарантира одобрение.",
  },
  "/kredit-bez-trudov-dogovor": {
    title: "Кредит без трудов договор — възможности | Veyra",
    description:
      "Самоосигуряващи се, свободни професии и пенсионери също имат доказуем доход. Veyra сравнява данните с критериите на партньорите. Одобрението е на кредитора.",
  },
  "/potrebitelski-kredit": {
    title: "Потребителски кредит — сравни условия | Veyra",
    description:
      "Какво определя цената на потребителския кредит, какво преценяват кредиторите и на какво да обърнеш внимание преди да подпишеш. Veyra не е кредитор.",
  },
  "/kredit-za-avtomobil": {
    title: "Кредит за автомобил — потребителски, автокредит или лизинг | Veyra",
    description:
      "Трите начина да финансираш автомобил и какво ги различава. Какво да сравниш освен лихвата. Veyra сравнява възможности — решението е на кредитора.",
  },
  "/kredit-za-remont": {
    title: "Кредит за ремонт на жилище — как да прецениш | Veyra",
    description:
      "Как да определиш реалистична сума за ремонт, как да съобразиш срока и какво да сравниш между офертите. Veyra не е кредитор — сравняваме възможности.",
  },
  "/obedinyavane-na-zadalzheniya": {
    title: "Обединяване на задължения — как работи консолидацията | Veyra",
    description:
      "Обединяване на няколко задължения в едно с една вноска. Как работи, кога има смисъл и на какво да внимаваш. Veyra не е кредитор — сравняваме възможности.",
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
      ? {
          title: seo.title,
          description: seo.description,
          url: `${SITE_URL}${canonical}`,
          // A child openGraph does not inherit the parent's images in Next, so
          // set them explicitly to keep the share card on every page.
          images: ["/og.png"],
        }
      : undefined,
    twitter: seo
      ? { title: seo.title, description: seo.description, images: ["/og.png"] }
      : undefined,
    ...overrides,
  };
}

// Routes that must never be indexed (they carry an in-progress application /
// personal data or are transient).
export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};
