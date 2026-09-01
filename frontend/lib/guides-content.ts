// Editorial content for the /guides section. Real, useful answers to questions
// people search before taking a consumer loan — not thin SEO filler. Content is
// compliance-safe: no approval guarantees, no "best/lowest" claims; Veyra is
// framed as a marketplace, final decisions belong to the partner.
//
// Copy is keyed by locale for the same reason as the landing pages: a guide
// cannot ship in one language and then be served under the other's URL.
// `updated` and `readingMinutes` are facts about the article itself, not about
// a translation of it, so they sit outside the per-locale copy.
import type { Locale } from "@/i18n/config";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string };

/** Everything in a guide that is language-dependent. */
export type GuideCopy = {
  title: string; // H1
  metaTitle: string;
  description: string;
  intro: string;
  blocks: Block[];
  faq: { q: string; a: string }[];
};

export type Guide = {
  slug: string;
  updated: string; // ISO date
  readingMinutes: number;
  copy: Record<Locale, GuideCopy>;
};

export const GUIDES: Guide[] = [
  {
    slug: "kakvo-e-gpr",
    updated: "2026-08-31",
    readingMinutes: 4,
    copy: {
      bg: {
        title: "Какво е ГПР и защо е по-важен от лихвата?",
        metaTitle: "Какво е ГПР? Обяснено просто | Veyra",
        description:
          "ГПР (годишен процент на разходите) показва реалната цена на кредита за една година — лихва плюс такси. Ето как да го четеш и защо е по-точен от лихвата.",
        intro:
          "Когато сравняваш кредити, лихвата рядко е цялата истина. ГПР събира лихвата и задължителните такси в едно число, което показва колко наистина струва кредитът за една година.",
        blocks: [
          { type: "h2", text: "Какво означава ГПР" },
          {
            type: "p",
            text: "ГПР е съкращение от „годишен процент на разходите“. За разлика от годишната лихва, ГПР включва и задължителните такси по кредита — такси за обработка, управление и други разходи, които влизат в общата цена.",
          },
          {
            type: "callout",
            text: "Два кредита с еднаква лихва може да имат различен ГПР. По-високият ГПР обикновено означава повече такси.",
          },
          { type: "h2", text: "Защо ГПР е по-полезен от лихвата" },
          {
            type: "p",
            text: "Лихвата показва само цената на заетите пари. ГПР показва цената на целия кредит. Затова при сравнение на две оферти ГПР е по-честният показател.",
          },
          { type: "h2", text: "Какво НЕ включва ГПР" },
          {
            type: "ul",
            items: [
              "Разходи при забава или неплащане (наказателни лихви, такси за просрочие).",
              "Незадължителни услуги, които сам избираш допълнително.",
              "Нотариални или други разходи извън договора за кредит, ако е приложимо.",
            ],
          },
          { type: "h2", text: "Как да го използваш на практика" },
          {
            type: "ul",
            items: [
              "Сравнявай ГПР между оферти, а не само лихвата.",
              "Питай коя такса влиза в ГПР и коя не.",
              "Гледай и общата сума за връщане, не само месечната вноска.",
            ],
          },
        ],
        faq: [
          {
            q: "ГПР и лихва едно и също нещо ли са?",
            a: "Не. Лихвата е цената на заетите пари, а ГПР включва лихвата плюс задължителните такси, така че отразява реалната годишна цена на кредита.",
          },
          {
            q: "По-нисък ГПР винаги ли е по-добре?",
            a: "По-ниският ГПР обикновено означава по-ниска цена, но винаги преценявай и срока, общата сума за връщане и условията на конкретния партньор.",
          },
        ],
      },
      en: {
        title: "What is APR, and why does it matter more than the interest rate?",
        metaTitle: "What is APR? Explained simply | Veyra",
        description:
          "The APR (annual percentage rate of charge) shows what a loan really costs over a year — interest plus fees. Here is how to read it, and why it is more accurate than the interest rate.",
        intro:
          "When you compare loans, the interest rate is rarely the whole truth. The APR gathers the interest and the mandatory fees into a single figure that shows what the loan actually costs over a year.",
        blocks: [
          { type: "h2", text: "What APR means" },
          {
            type: "p",
            text: "APR stands for the annual percentage rate of charge. Unlike the annual interest rate, the APR also includes the loan's mandatory fees — arrangement fees, servicing fees and other charges that form part of the total cost.",
          },
          {
            type: "callout",
            text: "Two loans with the same interest rate can have different APRs. A higher APR usually means more fees.",
          },
          { type: "h2", text: "Why the APR is more useful than the interest rate" },
          {
            type: "p",
            text: "The interest rate shows only the price of the money you borrow. The APR shows the price of the whole loan. That is what makes it the more honest figure when you put two offers side by side.",
          },
          { type: "h2", text: "What the APR does NOT include" },
          {
            type: "ul",
            items: [
              "Costs arising from late payment or non-payment (default interest, arrears fees).",
              "Optional services you choose to add yourself.",
              "Notary or other costs outside the credit agreement, where applicable.",
            ],
          },
          { type: "h2", text: "How to use it in practice" },
          {
            type: "ul",
            items: [
              "Compare the APR between offers, not just the interest rate.",
              "Ask which fees are inside the APR and which are not.",
              "Look at the total amount repayable too, not only the monthly instalment.",
            ],
          },
        ],
        faq: [
          {
            q: "Are the APR and the interest rate the same thing?",
            a: "No. The interest rate is the price of the money you borrow, while the APR includes the interest plus the mandatory fees, so it reflects the real annual cost of the loan.",
          },
          {
            q: "Is a lower APR always better?",
            a: "A lower APR usually means a lower cost, but always weigh up the term, the total amount repayable and the particular partner's terms as well.",
          },
        ],
      },
    },
  },
  {
    slug: "mesechna-vnoska",
    updated: "2026-08-31",
    readingMinutes: 5,
    copy: {
      bg: {
        title: "Каква месечна вноска мога да си позволя?",
        metaTitle: "Каква месечна вноска мога да си позволя? | Veyra",
        description:
          "Практичен начин да прецениш посилна месечна вноска според доходите и съществуващите задължения — преди да поемеш нов кредит.",
        intro:
          "Преди да теглиш кредит, най-важният въпрос не е „каква сума“, а „каква месечна вноска се вписва спокойно в бюджета ми“. Ето един прост начин да прецениш.",
        blocks: [
          { type: "h2", text: "Започни от бюджета, не от сумата" },
          {
            type: "p",
            text: "Погледни какво остава от дохода ти всеки месец, след като покриеш наем/ипотека, сметки, храна и текущите вноски по други задължения. Новата вноска трябва да се събира в този остатък — с резерв.",
          },
          {
            type: "callout",
            text: "Общо правило за ориентир: сумата на всички месечни вноски по кредити да не изяжда голяма част от дохода ти. Остави буфер за непредвидени разходи.",
          },
          { type: "h2", text: "Отчети съществуващите задължения" },
          {
            type: "p",
            text: "Ако вече имаш вноски по кредити или кредитни карти, събери ги. Новата вноска се добавя към тях — важна е общата тежест, не всяка вноска поотделно.",
          },
          { type: "h2", text: "По-дълъг срок = по-ниска вноска, но по-висока обща цена" },
          {
            type: "p",
            text: "Разсрочването на по-дълъг период намалява месечната вноска, но обикновено увеличава общата сума, която връщаш. Балансирай посилна вноска с разумна обща цена.",
          },
          { type: "h2", text: "Провери, преди да решиш" },
          {
            type: "ul",
            items: [
              "Каква е месечната вноска и вписва ли се спокойно в бюджета ти?",
              "Каква е общата сума за връщане за целия срок?",
              "Какъв е ГПР и какви такси влизат в него?",
              "Какво се случва при забавяне на вноска?",
            ],
          },
        ],
        faq: [
          {
            q: "Как да преценя вноската за дадена сума и срок?",
            a: "Използвай кредитен калкулатор — въвеждаш сума, срок и лихва и виждаш ориентировъчна месечна вноска и обща цена, без заявка.",
          },
          {
            q: "Veyra решава ли дали да получа кредит?",
            a: "Не. Veyra е маркетплейс — сравнява въведените данни с критериите на партньорите и показва подходящи възможности. Окончателното решение се взема от съответния кредитор.",
          },
        ],
      },
      en: {
        title: "What monthly instalment can I afford?",
        metaTitle: "What monthly instalment can I afford? | Veyra",
        description:
          "A practical way to work out an affordable monthly instalment from your income and your existing commitments — before you take on new credit.",
        intro:
          "Before you borrow, the most important question is not “how much” but “what monthly instalment fits comfortably within my budget”. Here is a simple way to work it out.",
        blocks: [
          { type: "h2", text: "Start from the budget, not from the amount" },
          {
            type: "p",
            text: "Look at what is left of your income each month once you have covered rent or mortgage, bills, food and the instalments on your other commitments. The new instalment has to fit inside what remains — with room to spare.",
          },
          {
            type: "callout",
            text: "A rough rule of thumb: your credit instalments together should not swallow a large share of your income. Leave a buffer for unexpected costs.",
          },
          { type: "h2", text: "Account for your existing commitments" },
          {
            type: "p",
            text: "If you already have loan or credit card instalments, add them up. The new instalment goes on top of them — what matters is the total burden, not each instalment on its own.",
          },
          { type: "h2", text: "A longer term = a lower instalment, but a higher total cost" },
          {
            type: "p",
            text: "Spreading repayment over a longer period lowers the monthly instalment, but usually increases the total amount you repay. Balance an affordable instalment against a sensible total cost.",
          },
          { type: "h2", text: "Check before you decide" },
          {
            type: "ul",
            items: [
              "What is the monthly instalment, and does it fit comfortably within your budget?",
              "What is the total amount repayable over the full term?",
              "What is the APR, and which fees does it include?",
              "What happens if an instalment is late?",
            ],
          },
        ],
        faq: [
          {
            q: "How do I work out the instalment for a given amount and term?",
            a: "Use a credit calculator — you enter an amount, a term and an interest rate, and see an indicative monthly instalment and total cost, with no request needed.",
          },
          {
            q: "Does Veyra decide whether I get credit?",
            a: "No. Veyra is a marketplace — it compares the details you enter against partners' criteria and shows the options that fit. The final decision is made by the lender concerned.",
          },
        ],
      },
    },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** A guide's copy in one locale — what a page actually renders. */
export function getGuideCopy(
  slug: string,
  locale: Locale
): GuideCopy | undefined {
  return getGuide(slug)?.copy[locale];
}
