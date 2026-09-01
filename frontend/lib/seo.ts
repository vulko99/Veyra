import type { Metadata } from "next";
import { defaultLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/locale";
import { isBgOnlyPath } from "@/lib/bg-only";

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

// English title + description for the paths that genuinely have an English
// version. Each entry mirrors the Bulgarian one above, including the
// marketplace framing and the "Veyra is not a lender" qualifier — a translated
// page that quietly drops the disclaimer is worse than an untranslated one.
//
// Presence in this map is what makes a page's English twin indexable. A path
// missing here still renders in English, but is marked noindex rather than
// being published to search under a Bulgarian title. That is deliberate: it
// means adding English SEO copy is the single act that turns an English page
// on for search, and forgetting to add it cannot leak a mislabelled page.
export const PAGE_SEO_EN: Record<string, Seo> = {
  "/how-it-works": {
    title: "How Veyra works — comparing credit options",
    description:
      "You fill in one application, Veyra compares it against partners' published criteria and shows the options you match. You choose where to continue.",
  },
  "/loans": {
    title: "Types of credit and options | Veyra",
    description:
      "Consumer credit, short-term credit and refinancing from our partners. Veyra is not a lender — we compare options against the details you enter.",
  },
  "/faq": {
    title: "Frequently asked questions | Veyra",
    description:
      "Is Veyra a lender? Why do I see more than one option? Answers about compatibility, consent, and how the marketplace works.",
  },
  "/responsible-borrowing": {
    title: "Responsible borrowing | Veyra",
    description:
      "What to weigh up before taking on credit: total cost, monthly instalment, existing commitments and the partner's terms. Practical guidance, no spin.",
  },
  "/about": {
    title: "About Veyra — a financial marketplace",
    description:
      "Veyra is a marketplace for credit options. We do not lend and we do not make approval decisions — we connect you with suitable partners.",
  },
  "/partners": {
    title: "Partners | Veyra",
    description:
      "How Veyra works with financial partners, and how matching options are shown according to their published criteria.",
  },
  "/contact": {
    title: "Contact | Veyra",
    description: "Get in touch with the Veyra team.",
  },
  "/cookies": {
    title: "Cookie policy | Veyra",
    description: "How Veyra uses cookies and similar technologies.",
  },
  "/privacy": {
    title: "Privacy policy | Veyra",
    description: "How Veyra processes and protects your personal data.",
  },
  "/terms": {
    title: "Terms of use | Veyra",
    description: "The terms and conditions for using Veyra.",
  },
  "/kak-podrezhdame-ofertite": {
    title: "How we order the options | Veyra",
    description:
      "Which parameters Veyra uses to order the options shown, whether commercial arrangements affect that order, and how we earn. Full ranking transparency.",
  },
  "/kalkulator": {
    title: "Credit calculator — monthly instalment and total cost | Veyra",
    description:
      "Work out an indicative monthly instalment and total cost by amount, term and interest rate. Free calculator — no application, no sign-up.",
  },
};

/**
 * Build Next Metadata for a static path, in a given locale.
 *
 * Canonical and hreflang follow the URL shape in `lib/locale.ts`: Bulgarian is
 * unprefixed, English lives under `/en`. Three cases:
 *
 *  - Bulgarian-only content (landing pages, guides): canonical always points at
 *    the Bulgarian URL and no alternates are advertised, because no English
 *    version of that prose exists. The `/en` twin is noindex, so an English
 *    reader who follows a link still gets English chrome without a
 *    near-duplicate page entering the index.
 *  - A translated page with English SEO copy: canonical is the page's own URL
 *    and both languages are cross-declared, with Bulgarian as x-default.
 *  - A translated page without English SEO copy yet: noindex in English.
 */
export function buildMetadata(
  path: string,
  locale: Locale = defaultLocale,
  overrides: Partial<Metadata> = {}
): Metadata {
  const bgOnly = isBgOnlyPath(path);
  const english = locale !== defaultLocale;
  const hasEnglishSeo = Boolean(PAGE_SEO_EN[path]);

  const seo = english ? PAGE_SEO_EN[path] ?? PAGE_SEO[path] : PAGE_SEO[path];
  // A Bulgarian-only page canonicalises to its Bulgarian URL from either locale.
  const canonical = bgOnly ? path : localePath(locale, path);
  const indexable = !english || (hasEnglishSeo && !bgOnly);

  return {
    title: seo?.title,
    description: seo?.description,
    alternates: {
      canonical,
      // Only claim an alternate that actually exists in that language.
      languages:
        bgOnly || !hasEnglishSeo
          ? undefined
          : {
              bg: path,
              en: localePath("en", path),
              "x-default": path,
            },
    },
    robots: indexable ? undefined : { index: false, follow: true },
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

/**
 * `generateMetadata` for a static path, resolving the locale from the route.
 *
 * Pages export this instead of a static `metadata` object because the canonical
 * URL, the hreflang set and whether the page is indexable all depend on which
 * locale is being rendered — none of which is knowable at module scope.
 */
export function localizedMetadata(
  path: string,
  overrides: Partial<Metadata> = {}
) {
  return function generateMetadata({
    params,
  }: {
    params: { locale: Locale };
  }): Metadata {
    return buildMetadata(path, params.locale ?? defaultLocale, overrides);
  };
}

// Routes that must never be indexed (they carry an in-progress application /
// personal data or are transient).
export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};
