// Content for SEO landing pages built around real Bulgarian search intent.
// Each page carries genuinely useful information and a single clear CTA into the
// Veyra application. Compliance-safe: no approval guarantees, no "best/lowest"
// claims; Veyra is a marketplace, the lender makes the final decision.
//
// Every page exists in both locales. The copy is keyed by locale rather than
// stored flat, so the type system will not let a new landing page ship in one
// language only — which is how these pages ended up being Bulgarian prose
// behind an English URL before.
//
// The English is a translation, not a rewrite: it carries the same marketplace
// framing and the same "Veyra is not a lender / approval is not guaranteed"
// qualifiers as the Bulgarian. A translated page that quietly drops a
// disclaimer is worse than an untranslated one.
import type { Locale } from "@/i18n/config";

export type LandingSection = {
  h2: string;
  body?: string;
  bullets?: string[];
};

/** Everything on a landing page that is language-dependent. */
export type LandingCopy = {
  eyebrow: string;
  h1: string;
  intro: string;
  sections: LandingSection[];
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
};

export type Landing = {
  slug: string;
  /**
   * Whether this page may be used as a destination for PAID traffic.
   *
   * Google prohibits advertising personal loans requiring full repayment
   * within 60 days, and it reviews the landing page, not just the ad. Pages
   * built around sub-60-day products ("кредит до заплата") and around speed as
   * the search intent ("бързи кредити") are organic-only.
   *
   * Organic targeting of these terms is intended and stays — this flag exists
   * so a paid campaign can filter them out programmatically instead of relying
   * on someone remembering.
   */
  adEligible: boolean;
  copy: Record<Locale, LandingCopy>;
};

const KREDITI: Landing = {
  slug: "krediti",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Кредити онлайн",
      h1: "Кредити онлайн — сравни възможности с една заявка",
      intro:
        "Veyra е финансов маркетплейс. Попълваш една заявка, а ние я сравняваме с публикуваните критерии на нашите партньори и ти показваме подходящите възможности. Не отпускаме кредити и не вземаме решение вместо теб — изборът остава твой.",
      sections: [
        {
          h2: "Как да сравниш кредити разумно",
          body: "Вместо да обикаляш десетки сайтове, въвеждаш данните си веднъж и виждаш кои партньори съответстват на профила ти.",
          bullets: [
            "Отчитай общата цена на кредита, не само месечната вноска.",
            "Сравнявай ГПР, който включва лихва и такси.",
            "Провери какъв е срокът и колко общо ще върнеш.",
            "Прецени вписва ли се вноската спокойно в бюджета ти.",
          ],
        },
        {
          h2: "Видове кредити, които може да срещнеш",
          bullets: [
            "Краткосрочни кредити — по-малки суми за кратък период.",
            "Потребителски кредити — средни суми за по-дълъг срок.",
            "Рефинансиране и консолидация — обединяване на съществуващи задължения.",
          ],
        },
        {
          h2: "Защо през Veyra",
          body: "Една заявка може да съответства на критериите на повече от един партньор. Показваме ти всички подходящи възможности с прозрачно съответствие, за да избереш сам къде да продължиш.",
        },
      ],
      faq: [
        {
          q: "Veyra отпуска ли кредити?",
          a: "Не. Veyra е маркетплейс. Сравняваме въведените данни с критериите на партньорите и показваме подходящи възможности. Окончателното решение се взема от съответния кредитор.",
        },
        {
          q: "Гарантирате ли одобрение?",
          a: "Не. Никога не гарантираме одобрение и не обещаваме конкретна лихва. Съответствието показва доколко данните ти отговарят на публикуваните критерии.",
        },
      ],
      ctaTitle: "Готов ли си да видиш подходящите възможности?",
      ctaBody: "Без регистрация и без ангажимент да продължиш.",
    },
    en: {
      eyebrow: "Loans online",
      h1: "Loans online — compare options with one request",
      intro:
        "Veyra is a financial marketplace. You fill in one request, we compare it against our partners' published criteria and show you the options that fit. We do not lend and we do not decide for you — the choice stays yours.",
      sections: [
        {
          h2: "How to compare loans sensibly",
          body: "Instead of working through dozens of sites, you enter your details once and see which partners match your profile.",
          bullets: [
            "Look at the total cost of the loan, not just the monthly instalment.",
            "Compare the APR, which includes both interest and fees.",
            "Check the term, and how much you will repay in total.",
            "Judge whether the instalment fits comfortably within your budget.",
          ],
        },
        {
          h2: "Types of credit you may come across",
          bullets: [
            "Short-term credit — smaller amounts over a short period.",
            "Consumer credit — mid-sized amounts over a longer term.",
            "Refinancing and consolidation — bringing existing commitments together.",
          ],
        },
        {
          h2: "Why go through Veyra",
          body: "One request can match the criteria of more than one partner. We show you every option that fits, with transparent compatibility, so you can choose for yourself where to continue.",
        },
      ],
      faq: [
        {
          q: "Does Veyra lend money?",
          a: "No. Veyra is a marketplace. We compare the details you enter against our partners' criteria and show the options that fit. The final decision is made by the lender concerned.",
        },
        {
          q: "Do you guarantee approval?",
          a: "No. We never guarantee approval and we never promise a particular interest rate. Compatibility shows how far your details match the published criteria.",
        },
      ],
      ctaTitle: "Ready to see the options that fit?",
      ctaBody: "No sign-up, and no obligation to continue.",
    },
  },
};

const BARZI_KREDITI: Landing = {
  slug: "barzi-krediti",
  // Organic only: the search intent here is speed itself.
  adEligible: false,
  copy: {
    bg: {
      eyebrow: "Бързи кредити",
      h1: "Бързи кредити онлайн — сравни бързи кредити с една заявка",
      intro:
        "Търсиш бърз кредит? С Veyra попълваш една заявка и виждаш кои партньори съответстват на профила ти, вместо да кандидатстваш на много места. Veyra не е кредитор — сравняваме възможности по въведените критерии.",
      sections: [
        {
          h2: "Какво да провериш при бърз кредит",
          bullets: [
            "Обща цена за целия срок, не само бързината на усвояване.",
            "ГПР — включва лихвата и задължителните такси.",
            "Условията при забавяне на вноска.",
            "Дали вноската се вписва спокойно в месечния ти бюджет.",
          ],
        },
        {
          h2: "Внимателна преценка",
          body: "Кредитът е решение, не автоматичен избор. Прецени общата цена и съществуващите си задължения, преди да продължиш към партньор.",
        },
        {
          h2: "Как работи",
          body: "Въвеждаш сума, срок и няколко детайла. Механизмът на Veyra ги сравнява с публикуваните критерии на партньорите и показва подходящите възможности. Ти избираш към кои да продължиш.",
        },
      ],
      faq: [
        {
          q: "Колко бързо ще получа парите?",
          a: "Veyra не отпуска и не превежда средства. Скоростта на усвояване зависи изцяло от партньора, към който решиш да продължиш.",
        },
        {
          q: "Защо виждам повече от една възможност?",
          a: "Една заявка може да съответства на критериите на няколко партньора. Показваме ти всички подходящи възможности, за да решиш сам къде да продължиш.",
        },
      ],
      ctaTitle: "Сравни бързи кредити",
      ctaBody: "Една заявка, няколко възможности. Без регистрация и без ангажимент.",
    },
    en: {
      eyebrow: "Quick loans",
      h1: "Quick loans online — compare quick loans with one request",
      intro:
        "Looking for a quick loan? With Veyra you fill in one request and see which partners match your profile, instead of applying in several places. Veyra is not a lender — we compare options against the criteria you enter.",
      sections: [
        {
          h2: "What to check on a quick loan",
          bullets: [
            "The total cost over the full term, not just how quickly the money arrives.",
            "The APR — it includes the interest and the mandatory fees.",
            "The terms that apply if an instalment is late.",
            "Whether the instalment fits comfortably within your monthly budget.",
          ],
        },
        {
          h2: "Weigh it up carefully",
          body: "Credit is a decision, not an automatic choice. Weigh up the total cost and your existing commitments before you continue to a partner.",
        },
        {
          h2: "How it works",
          body: "You enter an amount, a term and a few details. Veyra's matching engine compares them against partners' published criteria and shows the options that fit. You choose which of them to continue with.",
        },
      ],
      faq: [
        {
          q: "How quickly will I get the money?",
          a: "Veyra neither lends nor transfers funds. How quickly the money is paid out depends entirely on the partner you decide to continue with.",
        },
        {
          q: "Why do I see more than one option?",
          a: "One request can match the criteria of several partners. We show you every option that fits, so you can decide for yourself where to continue.",
        },
      ],
      ctaTitle: "Compare quick loans",
      ctaBody: "One request, several options. No sign-up and no obligation.",
    },
  },
};

const KREDIT_ONLINE: Landing = {
  slug: "kredit-online",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Кредит онлайн",
      h1: "Кредит онлайн — кандидатствай с една заявка",
      intro:
        "Кандидатстването онлайн ти спестява обикаляне. С Veyra попълваш една заявка от телефон или компютър, а ние сравняваме въведените данни с публикуваните критерии на партньорите и ти показваме подходящите възможности. Veyra не е кредитор и не взема решение за одобрение.",
      sections: [
        {
          h2: "Как става онлайн кандидатстването",
          bullets: [
            "Въвеждаш сума, срок и няколко детайла за профила си — без регистрация.",
            "Механизмът на Veyra ги сравнява с критериите на партньорите.",
            "Виждаш всички подходящи възможности и избираш сам къде да продължиш.",
          ],
        },
        {
          h2: "Какво да провериш преди да продължиш",
          body: "Онлайн удобството не отменя внимателната преценка. Гледай общата цена, ГПР и дали месечната вноска се вписва в бюджета ти.",
        },
        {
          h2: "Прозрачно съответствие",
          body: "Показваме доколко данните ти отговарят на критериите на всеки партньор. Това е съответствие по критерии, а не вероятност за одобрение — окончателното решение е на кредитора.",
        },
      ],
      faq: [
        {
          q: "Нужна ли е регистрация?",
          a: "Не. Попълваш заявката без профил и парола. Събираме минимално количество данни, за да ти покажем подходящи възможности.",
        },
        {
          q: "Veyra отпуска ли онлайн кредити?",
          a: "Не. Veyra е маркетплейс. Сравняваме въведените данни с критериите на партньорите; кредитът и решението идват от съответния партньор.",
        },
      ],
      ctaTitle: "Кандидатствай онлайн с една заявка",
      ctaBody: "Една заявка, няколко възможности. Без регистрация и без ангажимент.",
    },
    en: {
      eyebrow: "Loan online",
      h1: "Loan online — apply with one request",
      intro:
        "Applying online saves you going from place to place. With Veyra you fill in one request from your phone or your computer, and we compare the details you enter against partners' published criteria and show you the options that fit. Veyra is not a lender and does not make approval decisions.",
      sections: [
        {
          h2: "How applying online works",
          bullets: [
            "You enter an amount, a term and a few details about your profile — no sign-up.",
            "Veyra's matching engine compares them against partners' criteria.",
            "You see every option that fits, and choose for yourself where to continue.",
          ],
        },
        {
          h2: "What to check before you continue",
          body: "The convenience of applying online does not remove the need for careful judgement. Look at the total cost, the APR, and whether the monthly instalment fits your budget.",
        },
        {
          h2: "Transparent compatibility",
          body: "We show how far your details match each partner's criteria. That is compatibility against criteria, not a likelihood of approval — the final decision belongs to the lender.",
        },
      ],
      faq: [
        {
          q: "Do I need to create an account?",
          a: "No. You fill in the request without an account or a password. We collect the minimum amount of data needed to show you options that fit.",
        },
        {
          q: "Does Veyra provide loans online?",
          a: "No. Veyra is a marketplace. We compare the details you enter against partners' criteria; the loan and the decision come from the partner concerned.",
        },
      ],
      ctaTitle: "Apply online with one request",
      ctaBody: "One request, several options. No sign-up and no obligation.",
    },
  },
};

const KREDIT_LOSHO_CKR: Landing = {
  slug: "kredit-s-losho-ckr",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Кредит и ЦКР",
      h1: "Кредит при лошо ЦКР — какво е важно да знаеш",
      intro:
        "ЦКР (Централен кредитен регистър) съдържа информация за задълженията ти. Различните партньори имат различни критерии и различно отношение към кредитната история. Veyra не е кредитор и не гарантира одобрение — сравняваме въведените данни с публикуваните критерии на партньорите и показваме подходящите възможности.",
      sections: [
        {
          h2: "Какво представлява ЦКР",
          body: "ЦКР е регистър, в който банки и финансови институции подават информация за кредитите и просрочията. Кредиторите го използват като част от собствената си оценка.",
        },
        {
          h2: "Може ли да има възможности при влошена история",
          body: "Критериите се определят от всеки партньор поотделно. Някои партньори отчитат повече фактори от кредитната история. Затова показваме няколко възможности — но окончателното решение винаги е на кредитора и одобрение не е гарантирано.",
        },
        {
          h2: "Отговорна преценка",
          bullets: [
            "Не поемай нов кредит, ако вноската не се вписва спокойно в бюджета ти.",
            "Отчети всички съществуващи задължения.",
            "Ако си в затруднение, потърси независим съвет преди да теглиш нов кредит.",
          ],
        },
      ],
      faq: [
        {
          q: "Гарантирате ли кредит при лошо ЦКР?",
          a: "Не. Никога не гарантираме одобрение. Показваме възможности според публикуваните критерии, а решението се взема от съответния кредитор.",
        },
        {
          q: "Влияе ли заявката на моето ЦКР?",
          a: "Попълването на заявката във Veyra само по себе си не е кандидатстване пред кредитор. Ако продължиш към партньор, той провежда собствен процес.",
        },
      ],
      ctaTitle: "Виж какви възможности съответстват на профила ти",
      ctaBody: "Без гаранция за одобрение. Прозрачно съответствие по критерии.",
    },
    en: {
      eyebrow: "Credit and the ЦКР",
      h1: "Credit with a poor ЦКР record — what you should know",
      intro:
        "The ЦКР — Bulgaria's Central Credit Register — holds information about your credit commitments. Different partners have different criteria, and take different views of credit history. Veyra is not a lender and does not guarantee approval — we compare the details you enter against partners' published criteria and show the options that fit.",
      sections: [
        {
          h2: "What the ЦКР is",
          body: "The ЦКР is a register to which banks and financial institutions report credit agreements and arrears. Lenders use it as part of their own assessment.",
        },
        {
          h2: "Can there be options with an impaired history",
          body: "Criteria are set by each partner separately, and some partners weigh up more than credit history alone. That is why we show several options — but the final decision always belongs to the lender, and approval is never guaranteed.",
        },
        {
          h2: "Borrowing responsibly",
          bullets: [
            "Do not take on new credit if the instalment does not fit comfortably within your budget.",
            "Account for all of your existing commitments.",
            "If you are in difficulty, seek independent advice before taking on new credit.",
          ],
        },
      ],
      faq: [
        {
          q: "Do you guarantee credit with a poor ЦКР record?",
          a: "No. We never guarantee approval. We show options according to published criteria, and the decision is made by the lender concerned.",
        },
        {
          q: "Does the request affect my ЦКР record?",
          a: "Filling in the request on Veyra is not in itself an application to a lender. If you continue to a partner, that partner runs its own process.",
        },
      ],
      ctaTitle: "See which options match your profile",
      ctaBody: "No guarantee of approval. Transparent compatibility against criteria.",
    },
  },
};

const KREDIT_DO_ZAPLATA: Landing = {
  slug: "kredit-do-zaplata",
  // Organic only: "кредит до заплата" products are typically 30-day, which
  // Google prohibits advertising.
  adEligible: false,
  copy: {
    bg: {
      eyebrow: "Кредит до заплата",
      h1: "Кредит до заплата — кратък срок, внимателна преценка",
      intro:
        "Кредитите „до заплата“ са малки суми за кратък период. Удобни са при неотложен разход, но обикновено имат по-висока обща цена спрямо срока. Veyra не е кредитор — сравняваме въведените данни с критериите на партньорите и показваме подходящите възможности, за да избереш сам.",
      sections: [
        {
          h2: "Кога има смисъл",
          body: "Краткосрочният кредит може да покрие спешен разход, който ще погасиш скоро. Ако имаш нужда от по-дълъг срок, обмисли потребителски кредит с по-разсрочени вноски.",
        },
        {
          h2: "На какво да обърнеш внимание",
          bullets: [
            "Обща цена за целия срок, не само бързината.",
            "ГПР, който включва лихвата и таксите.",
            "Какво се случва при забавяне на вноската.",
          ],
        },
        {
          h2: "Алтернативи",
          body: "Ако сумата е по-голяма или срокът по-дълъг, разгледай потребителски кредити. Използвай калкулатора, за да сравниш месечната вноска и общата цена.",
        },
      ],
      faq: [
        {
          q: "Колко бързо се усвоява кредит до заплата?",
          a: "Veyra не превежда средства. Скоростта зависи изцяло от партньора, към когото решиш да продължиш.",
        },
        {
          q: "По-скъп ли е краткосрочният кредит?",
          a: "Спрямо срока общата цена често е по-висока. Затова е важно да гледаш ГПР и общата сума за връщане, а не само бързината.",
        },
      ],
      ctaTitle: "Сравни краткосрочни възможности",
      ctaBody: "Прегледай подходящите възможности и избери сам къде да продължиш.",
    },
    en: {
      eyebrow: "Payday loan",
      h1: "Payday loan — a short term, and careful judgement",
      intro:
        "“Payday” loans are small amounts over a short period. They suit an urgent expense, but relative to the term their total cost is usually higher. Veyra is not a lender — we compare the details you enter against partners' criteria and show the options that fit, so you can choose for yourself.",
      sections: [
        {
          h2: "When it makes sense",
          body: "Short-term credit can cover an urgent expense you will repay soon. If you need a longer term, consider consumer credit with the instalments spread further out.",
        },
        {
          h2: "What to pay attention to",
          bullets: [
            "The total cost over the full term, not just the speed.",
            "The APR, which includes the interest and the fees.",
            "What happens if an instalment is late.",
          ],
        },
        {
          h2: "Alternatives",
          body: "If the amount is larger or the term longer, look at consumer credit. Use the calculator to compare the monthly instalment and the total cost.",
        },
      ],
      faq: [
        {
          q: "How quickly is a payday loan paid out?",
          a: "Veyra does not transfer funds. The speed depends entirely on the partner you decide to continue with.",
        },
        {
          q: "Is short-term credit more expensive?",
          a: "Relative to the term, the total cost is often higher. That is why it matters to look at the APR and the total amount repayable, not just the speed.",
        },
      ],
      ctaTitle: "Compare short-term options",
      ctaBody: "Review the options that fit, and choose for yourself where to continue.",
    },
  },
};

const KREDIT_BEZ_TRUDOV: Landing = {
  slug: "kredit-bez-trudov-dogovor",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Без трудов договор",
      h1: "Кредит без трудов договор — какви са възможностите",
      intro:
        "Не всеки има стандартен трудов договор — самоосигуряващи се, свободни професии и пенсионери също имат доходи. Различните партньори признават различни видове доказуем доход. Veyra не е кредитор — сравняваме въведените данни с публикуваните критерии и показваме подходящите възможности.",
      sections: [
        {
          h2: "Какво може да се брои за доход",
          bullets: [
            "Доходи от самоосигуряване или свободна професия.",
            "Пенсия.",
            "Други доказуеми редовни постъпления, ако партньорът ги признава.",
          ],
        },
        {
          h2: "Всеки партньор преценява сам",
          body: "Изискванията за доход и заетост са част от критериите на всеки партньор. Затова показваме няколко възможности — но одобрението и условията се определят от кредитора.",
        },
        {
          h2: "Преди да продължиш",
          body: "Провери дали вноската се вписва в реалния ти месечен бюджет и каква е общата цена на кредита за целия срок.",
        },
      ],
      faq: [
        {
          q: "Мога ли да кандидатствам без трудов договор?",
          a: "Заявката във Veyra е отворена. Дали отговаряш на критериите зависи от конкретния партньор и вида доказуем доход, който признава.",
        },
        {
          q: "Гарантирате ли одобрение?",
          a: "Не. Показваме съответствие по публикувани критерии; окончателното решение се взема от съответния кредитор.",
        },
      ],
      ctaTitle: "Виж подходящите възможности за твоя профил",
      ctaBody: "Без гаранция за одобрение. Ти избираш къде да продължиш.",
    },
    en: {
      eyebrow: "Without an employment contract",
      h1: "Credit without an employment contract — what the options are",
      intro:
        "Not everyone has a standard employment contract — self-employed people, freelancers and pensioners have an income too. Different partners recognise different kinds of demonstrable income. Veyra is not a lender — we compare the details you enter against published criteria and show the options that fit.",
      sections: [
        {
          h2: "What can count as income",
          bullets: [
            "Income from self-employment or freelance work.",
            "A pension.",
            "Other demonstrable regular income, where the partner recognises it.",
          ],
        },
        {
          h2: "Every partner judges for itself",
          body: "Income and employment requirements are part of each partner's criteria. That is why we show several options — but approval and terms are set by the lender.",
        },
        {
          h2: "Before you continue",
          body: "Check whether the instalment fits your real monthly budget, and what the loan costs in total over the full term.",
        },
      ],
      faq: [
        {
          q: "Can I apply without an employment contract?",
          a: "The Veyra request is open to everyone. Whether you meet the criteria depends on the particular partner and the kind of demonstrable income it recognises.",
        },
        {
          q: "Do you guarantee approval?",
          a: "No. We show compatibility against published criteria; the final decision is made by the lender concerned.",
        },
      ],
      ctaTitle: "See the options that fit your profile",
      ctaBody: "No guarantee of approval. You choose where to continue.",
    },
  },
};

const OBEDINYAVANE: Landing = {
  slug: "obedinyavane-na-zadalzheniya",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Обединяване на задължения",
      h1: "Обединяване на задължения — как работи консолидацията",
      intro:
        "Обединяването (консолидацията) събира няколко задължения в едно, с една вноска. Целта е по-ясен погасителен план, а понякога — по-ниска обща месечна тежест. Veyra не е кредитор — сравняваме въведените данни с критериите на партньорите и показваме подходящите възможности.",
      sections: [
        {
          h2: "Какво е обединяване на задължения",
          body: "Вместо няколко отделни вноски към различни кредитори, теглиш един кредит, с който покриваш съществуващите задължения, и оттам нататък плащаш една вноска.",
        },
        {
          h2: "Кога има смисъл",
          bullets: [
            "Когато следиш трудно няколко вноски с различни дати.",
            "Когато търсиш по-ясен и предвидим погасителен план.",
            "Когато новите условия намаляват общата месечна тежест — но провери общата цена за целия срок.",
          ],
        },
        {
          h2: "На какво да внимаваш",
          body: "По-дълъг срок може да намали вноската, но да увеличи общата сума, която връщаш. Сравни общата цена преди и след обединяването.",
        },
      ],
      faq: [
        {
          q: "Обединяването намалява ли винаги вноската?",
          a: "Не непременно. Зависи от сумата, срока и условията на партньора. Гледай и общата цена за целия срок, не само месечната вноска.",
        },
        {
          q: "Veyra рефинансира ли задължения?",
          a: "Не. Veyra е маркетплейс. Показваме подходящи възможности за консолидация от партньори; кредитът и решението идват от съответния партньор.",
        },
      ],
      ctaTitle: "Разгледай възможности за обединяване",
      ctaBody: "Една заявка, няколко възможности. Ти решаваш къде да продължиш.",
    },
    en: {
      eyebrow: "Debt consolidation",
      h1: "Debt consolidation — how bringing your commitments together works",
      intro:
        "Consolidation gathers several commitments into one, with a single instalment. The aim is a clearer repayment plan and, sometimes, a lower total monthly burden. Veyra is not a lender — we compare the details you enter against partners' criteria and show the options that fit.",
      sections: [
        {
          h2: "What debt consolidation is",
          body: "Instead of several separate instalments to different lenders, you take out one loan that clears your existing commitments, and from then on you pay a single instalment.",
        },
        {
          h2: "When it makes sense",
          bullets: [
            "When several instalments falling due on different dates are hard to keep track of.",
            "When you want a clearer and more predictable repayment plan.",
            "When the new terms reduce the total monthly burden — but check the total cost over the full term.",
          ],
        },
        {
          h2: "What to watch out for",
          body: "A longer term can lower the instalment but increase the total amount you repay. Compare the total cost before and after consolidating.",
        },
      ],
      faq: [
        {
          q: "Does consolidating always lower the instalment?",
          a: "Not necessarily. It depends on the amount, the term and the partner's terms. Look at the total cost over the full term as well, not just the monthly instalment.",
        },
        {
          q: "Does Veyra refinance debt?",
          a: "No. Veyra is a marketplace. We show consolidation options from partners that fit; the loan and the decision come from the partner concerned.",
        },
      ],
      ctaTitle: "Explore consolidation options",
      ctaBody: "One request, several options. You decide where to continue.",
    },
  },
};

const POTREBITELSKI: Landing = {
  slug: "potrebitelski-kredit",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Потребителски кредит",
      h1: "Потребителски кредит — сравни условия с една заявка",
      intro:
        "Потребителският кредит е сума за лично ползване, която връщаш на месечни вноски за предварително договорен срок. Veyra не отпуска кредити — сравняваме въведените от теб данни с публикуваните критерии на партньорите и показваме подходящите възможности. Изборът и решението остават съответно твои и на кредитора.",
      sections: [
        {
          h2: "За какво обикновено се използва",
          bullets: [
            "Планирана покупка на техника, обзавеждане или образование.",
            "Ремонт или подобрение на жилището.",
            "Обединяване на няколко по-малки задължения в едно.",
            "Непредвиден разход, който не се покрива от спестявания.",
          ],
        },
        {
          h2: "Какво определя цената",
          body: "Общата цена зависи от сумата, срока, лихвения процент и таксите. По-дългият срок намалява месечната вноска, но обикновено увеличава общата сума, която връщаш.",
          bullets: [
            "ГПР — включва лихвата и задължителните такси, затова е по-честният показател от лихвата.",
            "Обща сума за връщане — колко плащаш общо за целия срок.",
            "Такси при предсрочно погасяване и при забавена вноска.",
          ],
        },
        {
          h2: "Какво преценяват кредиторите",
          body: "Всеки партньор публикува собствени критерии — диапазон на сумата и срока, минимален доход, вид заетост, възраст. Veyra сравнява въведените от теб данни точно с тези критерии. Това е проверка за съвместимост, а не кредитна оценка.",
        },
        {
          h2: "Преди да подпишеш",
          body: "Прочети договора и погасителния план. Провери дали вноската се вписва спокойно в бюджета ти заедно със съществените разходи и текущите ти задължения.",
        },
      ],
      faq: [
        {
          q: "Каква е разликата между потребителски и краткосрочен кредит?",
          a: "Потребителският кредит обикновено е за по-голяма сума и по-дълъг срок, с разсрочени месечни вноски. Краткосрочният е за по-малка сума и кратък период. Спрямо срока краткосрочният често излиза по-скъп.",
        },
        {
          q: "Мога ли да погася предсрочно?",
          a: "Зависи от условията на конкретния партньор. Провери в договора дали има такса за предсрочно погасяване и при какви условия се прилага.",
        },
        {
          q: "Veyra отпуска ли потребителски кредити?",
          a: "Не. Veyra е маркетплейс. Показваме подходящи възможности по публикувани критерии; кредитът, условията и решението идват от съответния партньор.",
        },
      ],
      ctaTitle: "Сравни възможности за потребителски кредит",
      ctaBody: "Една заявка, няколко възможности. Ти решаваш къде да продължиш.",
    },
    en: {
      eyebrow: "Consumer credit",
      h1: "Consumer credit — compare terms with one request",
      intro:
        "Consumer credit is a sum for personal use that you repay in monthly instalments over a term agreed in advance. Veyra does not lend — we compare the details you enter against partners' published criteria and show the options that fit. The choice remains yours, and the decision remains the lender's.",
      sections: [
        {
          h2: "What it is typically used for",
          bullets: [
            "A planned purchase — appliances, furniture or education.",
            "Repairs or improvements to your home.",
            "Bringing several smaller commitments together into one.",
            "An unexpected expense that savings do not cover.",
          ],
        },
        {
          h2: "What determines the cost",
          body: "The total cost depends on the amount, the term, the interest rate and the fees. A longer term lowers the monthly instalment but usually increases the total amount you repay.",
          bullets: [
            "The APR — it includes the interest and the mandatory fees, which makes it a more honest measure than the interest rate alone.",
            "Total amount repayable — what you pay in total over the full term.",
            "Fees for repaying early, and for a late instalment.",
          ],
        },
        {
          h2: "What lenders assess",
          body: "Each partner publishes its own criteria — amount and term ranges, minimum income, type of employment, age. Veyra compares the details you enter against exactly those criteria. That is a compatibility check, not a credit assessment.",
        },
        {
          h2: "Before you sign",
          body: "Read the contract and the repayment schedule. Check that the instalment fits comfortably within your budget alongside your essential costs and your current commitments.",
        },
      ],
      faq: [
        {
          q: "What is the difference between consumer credit and short-term credit?",
          a: "Consumer credit is usually for a larger amount over a longer term, with the instalments spread out. Short-term credit is for a smaller amount over a short period. Relative to the term, short-term credit often works out more expensive.",
        },
        {
          q: "Can I repay early?",
          a: "That depends on the particular partner's terms. Check the contract for whether there is an early repayment fee, and on what conditions it applies.",
        },
        {
          q: "Does Veyra provide consumer credit?",
          a: "No. Veyra is a marketplace. We show options that fit against published criteria; the loan, the terms and the decision come from the partner concerned.",
        },
      ],
      ctaTitle: "Compare consumer credit options",
      ctaBody: "One request, several options. You decide where to continue.",
    },
  },
};

const KREDIT_ZA_AVTOMOBIL: Landing = {
  slug: "kredit-za-avtomobil",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Кредит за автомобил",
      h1: "Кредит за автомобил — какви са възможностите",
      intro:
        "Автомобил може да се финансира по няколко начина: потребителски кредит, целеви автокредит или лизинг. Всеки има различна структура и различна обща цена. Veyra не е кредитор — сравняваме въведените данни с публикуваните критерии на партньорите и показваме подходящите възможности.",
      sections: [
        {
          h2: "Трите основни варианта",
          bullets: [
            "Потребителски кредит — парите са твои и купуваш като в брой; автомобилът е на твое име от самото начало.",
            "Целеви автокредит — обвързан е с покупката на конкретен автомобил и често изисква застраховка.",
            "Лизинг — ползваш автомобила срещу вноски; собствеността обикновено преминава в края на договора.",
          ],
        },
        {
          h2: "Какво да сравниш",
          bullets: [
            "ГПР, а не само лихвата — таксите могат да променят картината съществено.",
            "Първоначална вноска, ако се изисква.",
            "Задължителни застраховки и кой ги плаща.",
            "Обща сума за връщане за целия срок.",
            "Условия при предсрочно погасяване или продажба на автомобила.",
          ],
        },
        {
          h2: "Нов или употребяван",
          body: "Част от партньорите поставят условия за възрастта на автомобила при целево финансиране. При потребителски кредит такова ограничение обикновено няма, защото средствата не са обвързани с конкретна покупка.",
        },
        {
          h2: "Не забравяй разходите след покупката",
          body: "Освен вноската планирай застраховки, данък, технически преглед, гуми и поддръжка. Те не са част от кредита, но са част от реалния месечен бюджет.",
        },
      ],
      faq: [
        {
          q: "По-изгоден ли е автокредитът от потребителския?",
          a: "Не непременно. Целевият кредит понякога има по-нисък лихвен процент, но може да изисква застраховки и първоначална вноска. Сравнявай ГПР и общата сума за връщане, а не само лихвата.",
        },
        {
          q: "Мога ли да купя автомобил от частно лице?",
          a: "С потребителски кредит средствата не са обвързани с продавача. При целево финансиране и лизинг обикновено има изисквания към продавача и към автомобила — проверявай при конкретния партньор.",
        },
        {
          q: "Veyra предлага ли лизинг?",
          a: "Veyra не е кредитор и не предлага собствени продукти. Показваме подходящи възможности от партньори според публикуваните им критерии.",
        },
      ],
      ctaTitle: "Виж какви възможности съответстват на профила ти",
      ctaBody: "Без гаранция за одобрение. Окончателните условия се определят от партньора.",
    },
    en: {
      eyebrow: "Car finance",
      h1: "Car finance — what the options are",
      intro:
        "A car can be financed in several ways: consumer credit, a dedicated car loan, or leasing. Each has a different structure and a different total cost. Veyra is not a lender — we compare the details you enter against partners' published criteria and show the options that fit.",
      sections: [
        {
          h2: "The three main routes",
          bullets: [
            "Consumer credit — the money is yours and you buy as a cash buyer; the car is in your name from the outset.",
            "A dedicated car loan — tied to the purchase of a specific car, and it often requires insurance.",
            "Leasing — you use the car in return for instalments; ownership usually passes at the end of the agreement.",
          ],
        },
        {
          h2: "What to compare",
          bullets: [
            "The APR, not just the interest rate — fees can change the picture substantially.",
            "The deposit, where one is required.",
            "Mandatory insurance, and who pays for it.",
            "The total amount repayable over the full term.",
            "The terms for repaying early or selling the car.",
          ],
        },
        {
          h2: "New or used",
          body: "Some partners set conditions on the age of the car under dedicated finance. With consumer credit there is usually no such restriction, because the funds are not tied to a particular purchase.",
        },
        {
          h2: "Do not forget the costs after the purchase",
          body: "Alongside the instalment, plan for insurance, road tax, the roadworthiness test, tyres and servicing. They are not part of the loan, but they are part of your real monthly budget.",
        },
      ],
      faq: [
        {
          q: "Is a dedicated car loan better value than consumer credit?",
          a: "Not necessarily. A dedicated loan sometimes carries a lower interest rate, but it may require insurance and a deposit. Compare the APR and the total amount repayable, not just the interest rate.",
        },
        {
          q: "Can I buy a car from a private seller?",
          a: "With consumer credit the funds are not tied to the seller. Dedicated finance and leasing usually set requirements for both the seller and the car — check with the particular partner.",
        },
        {
          q: "Does Veyra offer leasing?",
          a: "Veyra is not a lender and does not offer products of its own. We show options from partners that fit their published criteria.",
        },
      ],
      ctaTitle: "See which options match your profile",
      ctaBody: "No guarantee of approval. The final terms are set by the partner.",
    },
  },
};

const KREDIT_ZA_REMONT: Landing = {
  slug: "kredit-za-remont",
  adEligible: true,
  copy: {
    bg: {
      eyebrow: "Кредит за ремонт",
      h1: "Кредит за ремонт на жилище — как да прецениш",
      intro:
        "Ремонтът рядко струва точно колкото е първоначалната сметка. Затова при финансиране на ремонт най-важни са реалистичният бюджет и срокът, който можеш да поддържаш. Veyra не отпуска кредити — сравняваме въведените данни с публикуваните критерии на партньорите и показваме подходящите възможности.",
      sections: [
        {
          h2: "Определи сумата, преди да търсиш кредит",
          bullets: [
            "Вземи оферти за материали и труд, а не приблизителна сметка.",
            "Заложи резерв за непредвидени разходи — при ремонт те са по-скоро правило.",
            "Раздели проекта на етапи, ако не всичко е спешно.",
          ],
        },
        {
          h2: "Съобрази срока с това, което ремонтираш",
          body: "Дълъг срок за нещо, което ще трябва да се подмени скоро, означава че продължаваш да плащаш за него дълго след като е изхабено. По-дългият срок намалява вноската, но увеличава общата цена.",
        },
        {
          h2: "Какво да сравниш",
          bullets: [
            "ГПР — включва лихвата и задължителните такси.",
            "Обща сума за връщане за целия срок.",
            "Дали има такса за предсрочно погасяване, ако решиш да приключиш по-рано.",
            "Дали вноската се вписва в бюджета ти заедно с текущите задължения.",
          ],
        },
        {
          h2: "Използвай калкулатора",
          body: "Преди да подадеш заявка, изчисли ориентировъчната месечна вноска и общата цена за няколко комбинации от сума и срок. Така влизаш в разговора с партньор с ясна представа какво можеш да поемеш.",
        },
      ],
      faq: [
        {
          q: "Трябва ли ипотека за кредит за ремонт?",
          a: "Не непременно. Ремонт често се финансира с потребителски кредит без обезпечение. Изискванията се определят от конкретния партньор и зависят от сумата.",
        },
        {
          q: "Мога ли да взема повече, за сигурност?",
          a: "Заемай това, което ти е нужно. Всяко евро отгоре носи лихва и такси за целия срок. Ако проектът се разрасне, преценявай наново, вместо да поемаш резерв предварително.",
        },
        {
          q: "Veyra финансира ли ремонти?",
          a: "Не. Veyra е маркетплейс — сравняваме въведените данни с критериите на партньорите. Кредитът и решението идват от съответния партньор.",
        },
      ],
      ctaTitle: "Сравни възможности за финансиране на ремонт",
      ctaBody: "Една заявка, няколко възможности. Без ангажимент да продължиш.",
    },
    en: {
      eyebrow: "Home renovation loan",
      h1: "A loan for home renovation — how to judge it",
      intro:
        "A renovation rarely costs exactly what the first estimate says. That is why, when you finance one, what matters most is a realistic budget and a term you can sustain. Veyra does not lend — we compare the details you enter against partners' published criteria and show the options that fit.",
      sections: [
        {
          h2: "Settle the amount before you look for credit",
          bullets: [
            "Get quotes for materials and labour rather than a rough estimate.",
            "Set aside a contingency — on a renovation, unexpected costs are closer to the rule than the exception.",
            "Split the project into stages if not all of it is urgent.",
          ],
        },
        {
          h2: "Match the term to what you are renovating",
          body: "A long term for something that will need replacing soon means paying for it long after it has worn out. A longer term lowers the instalment but increases the total cost.",
        },
        {
          h2: "What to compare",
          bullets: [
            "The APR — it includes the interest and the mandatory fees.",
            "The total amount repayable over the full term.",
            "Whether there is an early repayment fee, if you decide to finish sooner.",
            "Whether the instalment fits your budget alongside your current commitments.",
          ],
        },
        {
          h2: "Use the calculator",
          body: "Before you send a request, work out the indicative monthly instalment and total cost for a few combinations of amount and term. That way you go into a conversation with a partner knowing clearly what you can take on.",
        },
      ],
      faq: [
        {
          q: "Do I need a mortgage for a renovation loan?",
          a: "Not necessarily. Renovations are often financed with unsecured consumer credit. The requirements are set by the particular partner and depend on the amount.",
        },
        {
          q: "Can I borrow more than I need, just to be safe?",
          a: "Borrow what you need. Every extra euro carries interest and fees for the whole term. If the project grows, reassess then rather than taking on a buffer up front.",
        },
        {
          q: "Does Veyra finance renovations?",
          a: "No. Veyra is a marketplace — we compare the details you enter against partners' criteria. The loan and the decision come from the partner concerned.",
        },
      ],
      ctaTitle: "Compare ways to finance a renovation",
      ctaBody: "One request, several options. No obligation to continue.",
    },
  },
};

export const LANDINGS: Landing[] = [
  KREDITI,
  BARZI_KREDITI,
  KREDIT_ONLINE,
  KREDIT_LOSHO_CKR,
  KREDIT_DO_ZAPLATA,
  KREDIT_BEZ_TRUDOV,
  OBEDINYAVANE,
  POTREBITELSKI,
  KREDIT_ZA_AVTOMOBIL,
  KREDIT_ZA_REMONT,
];

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}

/** A landing page's copy in one locale — what a page actually renders. */
export function getLandingCopy(
  slug: string,
  locale: Locale
): LandingCopy | undefined {
  return getLanding(slug)?.copy[locale];
}

/** Landing pages that may be used as paid-traffic destinations. */
export const AD_ELIGIBLE_LANDINGS: Landing[] = LANDINGS.filter((l) => l.adEligible);
