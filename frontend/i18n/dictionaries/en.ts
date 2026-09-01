// English message catalog — prepared for future expansion.
// Must match the shape of the Bulgarian (default) catalog.
import type { Messages } from "./bg";

const en: Messages = {
  meta: {
    title: "Veyra — One request. Transparent comparison.",
    description:
      "Veyra compares our partners' options against publicly published criteria and shows why an option fits your profile. You decide who to continue with. Veyra is not a lender.",
  },
  common: {
    brand: "Veyra",
    startCta: "See your options",
    startShort: "See options",
    howItWorks: "How it works",
    back: "Back",
    continue: "Continue",
    disclaimer:
      "Veyra is not a lender. The final decision is made by the partner.",
    optional: "optional",
  },
  nav: {
    howItWorks: "How it works",
    loans: "Loans",
    calculator: "Calculator",
    faq: "FAQ",
    responsible: "Responsible borrowing",
    menu: "Menu",
    language: "Language",
  },
  footer: {
    tagline: "Financial decisions — clearer.",
    productTitle: "Product",
    companyTitle: "Company",
    legalTitle: "Legal",
    links: {
      howItWorks: "How it works",
      loans: "Loans",
      calculator: "Calculator",
      guides: "Guides",
      faq: "FAQ",
      about: "About",
      contact: "Contact",
      partners: "Partners",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      ranking: "How we rank offers",
    },
    rights: "All rights reserved.",
    disclaimer:
      "Veyra is not a lender. The final decision is made by the partner.",
  },
  home: {
    badge: "Financial marketplace",
    h1a: "One request.",
    h1b: "Transparent comparison.",
    subhead:
      "Veyra compares our partners' options against publicly published criteria. You decide who to continue with.",
    primaryCta: "See your options",
    secondaryCta: "How it works",
    viz: {
      request: "Your request",
      requestValue: "€2,000 · 12 months",
      engine: "Matching engine",
      engineNote: "Compares published criteria",
      matches: "3 relevant options",
      option: "Option",
      illustrative:
        "Illustration of the mechanism. The values shown are examples, not real offers or partners.",
      compatibility: "compatibility",
    },
    trust: [
      { stat: "1", label: "request" },
      { stat: "Published", label: "criteria" },
      { stat: "€0", label: "fee for you" },
    ],
    featuresTitle: "Why Veyra",
    featuresIntro: "A transparent choice — no surprises.",
    features: [
      {
        title: "One request",
        body: "You fill in the request once. We compare the relevant options against partners' published criteria.",
      },
      {
        title: "Transparent matching",
        body: "We show why an option fits your profile — against publicly published criteria, not a hidden assessment.",
      },
      {
        title: "The choice is yours",
        body: "You decide which partner to continue with. No obligation.",
      },
    ],
    stepsTitle: "How it works",
    stepsIntro: "From request to relevant options.",
    steps: [
      {
        title: "Tell us what you need",
        body: "Amount, term, and a few details about you. No registration.",
      },
      {
        title: "Veyra matches",
        body: "We compare your input against partners' published criteria and rank the relevant options.",
      },
      {
        title: "You choose",
        body: "Review the options and continue to a partner if you decide to. The decision is yours.",
      },
    ],
    ctaTitle: "Ready to see your options?",
    ctaBody: "No obligation to continue with any partner.",
    marketplace: {
      eyebrow: "Marketplace",
      title: "One application. Several options.",
      body: "One application can match the criteria of more than one partner. We show you every relevant option so you decide where to continue.",
      note: "Suitable based on the criteria you entered",
      illustrative:
        "Illustration. The values shown are examples, not real offers or partners.",
      cta: "Continue",
      compatibility: "compatibility",
      explainer:
        "Compatibility shows how well the data you entered matches the partner's configured criteria. It is not an approval probability. The final decision is made by the respective lender.",
    },
    tools: {
      title: "Tools",
      open: "Open",
      intro: "Everything here is usable without submitting an application.",
      calculator: {
        title: "Credit calculator",
        body: "Work out an indicative monthly instalment and total cost by amount, term and interest rate.",
      },
      guides: {
        title: "Guides",
        body: "What APR is, what instalment you can afford, and what to look for in the agreement.",
      },
      ranking: {
        title: "How we order the options",
        body: "Which parameters we use to order the options shown, and how we earn.",
      },
    },
  },
  howItWorks: {
    title: "How Veyra works",
    intro:
      "Veyra is a marketplace that connects you with relevant financial partners. Here is exactly what happens with your information.",
    sections: [
      {
        heading: "01 — You complete one application",
        body: "You tell us the amount and term you are considering and a few details about your situation. No password or account, and you can edit any step.",
      },
      {
        heading: "02 — You give explicit consent",
        body: "Before anything is shared, you decide what you agree to. Consent to processing and to sharing with partners is needed to show you options. Marketing is separate and optional.",
      },
      {
        heading: "03 — The engine matches",
        body: "We compare your information against each partner's published product criteria — amount, term, minimum income. This is a compatibility check, not a credit score and not a prediction of approval.",
      },
      {
        heading: "04 — You choose",
        body: "You see the relevant options and continue to a partner if you decide to. The partner runs its own process and makes the final decision.",
      },
      {
        heading: "How Veyra makes money",
        body: "When you continue to a partner and are subsequently approved, the partner may pay Veyra a fee. This never changes the options shown and costs you nothing.",
      },
    ],
  },
  loans: {
    title: "Options through our partners",
    intro:
      "Veyra does not lend money. We surface relevant products from our financial partners so you can compare and choose.",
    products: [
      {
        name: "Short-term loans",
        body: "Smaller amounts over shorter periods — for time-sensitive needs with a compact repayment schedule.",
      },
      {
        name: "Consumer loans",
        body: "Mid-sized amounts over longer terms — for planned purchases, home improvements, or consolidating debt.",
      },
      {
        name: "Refinancing & consolidation",
        body: "Options to reorganise existing borrowing into a single, clearer arrangement.",
      },
    ],
    neverTitle: "What we never do",
    neverList: [
      "We do not guarantee approval or promise a specific rate.",
      "We do not present partners we are not authorised to display.",
      "We do not make the final decision — the partner does.",
    ],
  },
  landing: {
    breadcrumbHome: "Home",
    relatedLabel: "Related pages",
    readingTitle: "Further reading",
    faqTitle: "Frequently asked questions",
    notLender:
      "Veyra is not a lender. The final decision and the terms are set by the partner concerned.",
    links: {
      loanTypes: "Types of credit",
      calculator: "Credit calculator",
      guides: "Guides",
    },
  },
  guides: {
    eyebrow: "Useful",
    title: "Guides to credit",
    intro:
      "Clear answers to the questions people ask before they borrow — no jargon, and nothing glossed over.",
    breadcrumb: "Guides",
    readingTime: "{minutes} min read",
    updated: "Updated {date}",
    faqTitle: "Questions and answers",
    ctaTitle: "See the options that fit you",
    ctaBody: "One request, several options. No sign-up and no obligation.",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Is Veyra a lender?",
        a: "No. Veyra does not lend money and does not make approval decisions. We compare the information you enter against partner criteria and show you relevant options.",
      },
      {
        q: "Why do I see more than one option?",
        a: "One application can match the criteria of more than one partner. Veyra shows you these options so you can decide for yourself where to continue.",
      },
      {
        q: "Does the request affect my credit history?",
        a: "No. Veyra does not query the ЦКР credit register and does not perform a credit assessment — we compare the information you enter against partners' published criteria. If you choose to continue to a partner, they run their own process, which may include a ЦКР check.",
      },
      {
        q: "Who sees my data?",
        a: "Veyra, and only the partners you select on the results page. We do not send your data to every partner at once and we do not sell it. Each partner is an independent data controller and is responsible for its own processing. The partner list is published on the Partners page.",
      },
      {
        q: "What happens after I choose a partner?",
        a: "We pass the selected partner the data needed to consider your request, in line with the consent you gave, and direct you to their site. From there the process is theirs: the partner may ask for further documents, makes its own assessment and takes the final decision on approval and terms. Veyra plays no part in that decision.",
      },
      {
        q: "Do you guarantee approval?",
        a: "No. We never guarantee approval and never promise a specific rate. Options shown are based on your input and each partner's published criteria.",
      },
      {
        q: "Do I need an account?",
        a: "No account or password is required. We collect a minimal amount of personal data.",
      },
      {
        q: "What does the match mean?",
        a: "It is an internal compatibility measure — how well your request fits a product's published criteria. It is not a credit score and not a probability of approval.",
      },
      {
        q: "How does Veyra make money?",
        a: "When you continue to a partner and are subsequently approved, the partner may pay Veyra a fee. This costs you nothing.",
      },
    ],
  },
  responsible: {
    title: "Responsible borrowing",
    intro:
      "Borrowing has real costs. We want you to make a decision that is right for you.",
    heroA: "Credit is a decision.",
    heroB: "Not an automatic choice.",
    heroSub: "A few things to weigh before taking on new borrowing.",
    calloutsTitle: "What to consider",
    callouts: [
      {
        label: "Total cost",
        body: "See what you pay over the whole term, not just the monthly payment.",
      },
      {
        label: "Monthly payment",
        body: "Make sure the payment fits comfortably within your budget.",
      },
      {
        label: "Existing obligations",
        body: "Account for your current credit before taking on more.",
      },
      {
        label: "Partner terms",
        body: "Read the interest, fees, and conditions of the specific partner.",
      },
    ],
    sections: [
      {
        heading: "Borrow only what you need",
        body: "Consider the total cost of borrowing, not just the monthly payment. A longer term can lower the payment but increase the total.",
      },
      {
        heading: "Check you can afford the repayments",
        body: "Look at your income and existing commitments. Make sure repayments fit comfortably alongside essential expenses.",
      },
      {
        heading: "Read the partner's terms",
        body: "Any agreement is with the partner, not Veyra. Read the rate, fees, and conditions carefully before signing.",
      },
      {
        heading: "If you are struggling",
        body: "If you are worried about debt, consult a qualified independent adviser or a consumer support organisation before taking on new borrowing.",
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "This summary explains, in plain language, how Veyra handles your data. It is not a substitute for the full legal policy, published before launch.",
    sections: [
      {
        heading: "Data minimisation",
        body: "We collect only what we need to show you options. We do not require an account, and we store metadata such as IP address and device only as one-way hashes.",
      },
      {
        heading: "Consent",
        body: "We process and share your data based on the explicit, versioned consent you give. Marketing consent is separate and optional.",
      },
      {
        heading: "Sharing with partners",
        body: "If you continue to a partner, relevant data is shared with them to process your enquiry. We only share with partners you choose to continue to.",
      },
      {
        heading: "Retention",
        body: "We keep personal data only as long as necessary and anonymise records past the retention window. An audit trail is kept for accountability.",
      },
      {
        heading: "Your rights",
        body: "Subject to applicable law, you may request access to, correction of, or deletion of your personal data via the contact page.",
      },
    ],
    footNote: "The policy version is recorded with each consent you provide.",
  },
  terms: {
    title: "Terms of use",
    intro:
      "A plain-language summary of how Veyra operates. Full legal terms will be published before launch.",
    sections: [
      {
        heading: "What Veyra is",
        body: "Veyra is a financial marketplace. We help you discover relevant options from our partners. We are not a lender, do not provide credit, and do not make lending decisions.",
      },
      {
        heading: "No guarantee",
        body: "Showing an option does not mean you will be approved. Approval, pricing, and terms are determined solely by the partner.",
      },
      {
        heading: "Your responsibilities",
        body: "You agree to provide accurate information and review any partner agreement carefully. Any credit agreement is between you and the partner.",
      },
      {
        heading: "Changes",
        body: "We may update these terms. The version in force is recorded with each consent.",
      },
    ],
  },
  contact: {
    title: "Contact us",
    intro:
      "We are happy to help with questions about how Veyra works or about your data.",
    generalTitle: "General enquiries",
    phoneTitle: "Phone",
    dataTitle: "Data & privacy",
    emailLabel: "Email:",
    note: "Contact addresses are placeholders for the MVP and will be finalised before launch.",
  },
  about: {
    title: "About Veyra",
    intro:
      "Veyra makes the financial choice clearer. We connect people with relevant financial partners through one request.",
    sections: [
      {
        heading: "Our mission",
        body: "The financial market is fragmented and hard to navigate. Veyra brings clarity — one request, transparent matching, and a choice that stays entirely yours.",
      },
      {
        heading: "What we are and are not",
        body: "Veyra is a marketplace, not a lender. We do not lend money or make lending decisions. We earn when we connect you successfully with a partner — at no cost to you.",
      },
      {
        heading: "Built for trust",
        body: "Data minimisation, explicit consent, and transparent matching criteria are at the core of the product from day one.",
      },
    ],
  },
  partners: {
    title: "Partners",
    intro:
      "Veyra works with licensed financial partners. We only show partners we are authorised to represent.",
    sections: [
      {
        heading: "For lenders and partners",
        body: "If you are a licensed lender or financial institution and want to reach relevant customers, we would love to talk.",
      },
      {
        heading: "Qualified, matched opportunities",
        body: "Veyra sends partners matched opportunities — applications whose entered data meets the partner's configured criteria.",
      },
      {
        heading: "Matching on configured criteria",
        body: "Matching is based on the criteria each partner configures — amount, term, income, employment and other rules. No hidden scoring, no fabricated terms.",
      },
      {
        heading: "Referrals by agreed rules",
        body: "Partners receive referrals according to agreed rules — match threshold, delivery method and the scope of shared data.",
      },
      {
        heading: "Commercial terms",
        body: "Commissions and commercial terms are defined by the actual agreement with each partner. We do not show fabricated terms or use partner logos without permission.",
      },
      {
        heading: "No approval guarantee",
        body: "Veyra is not a lender and does not guarantee approval. The final decision and terms are set by the respective partner.",
      },
    ],
    cta: "Get in touch",
    listTitle: "Partners your data may be shared with",
    listIntro:
      "Each of these partners is an independent data controller. Your data is passed only to the partner or partners you select on the results page.",
    listEmpty:
      "No partners are published yet. The list will be shown here before any data is shared with any partner.",
  },
  cookies: {
    title: "Cookie policy",
    intro:
      "A plain-language explanation of how Veyra uses cookies. The full policy will be published before launch.",
    sections: [
      {
        heading: "Necessary cookies",
        body: "We use minimal cookies and local storage to make the application work (for example, saving your input between steps) and to remember the language you chose, so the site opens in it. This data is not used for tracking and is not shared with partners.",
      },
      {
        heading: "Analytics cookies",
        body: "We may use privacy-friendly analytics to improve the product. They are not used for cross-site tracking.",
      },
      {
        heading: "Your choice",
        body: "You can manage cookies from your browser settings. Blocking some cookies may affect how the site works.",
      },
    ],
  },
  apply: {
    intro: {
      h1: "Let's find options for you",
      sub: "No account and no obligation to continue with any partner.",
      bullets: [
        "One short application",
        "Relevant options based on what you enter",
        "You decide whether to continue to a partner",
      ],
    },
    progress: "Step {current} of {total}",
    resultsLabel: "Results",
    steps: {
      amount: {
        label: "Amount",
        title: "How much do you need?",
        subtitle: "Choose an amount. You can change it later.",
        inputLabel: "Amount",
      },
      term: {
        label: "Term",
        title: "Over how long?",
        subtitle: "Choose the repayment period you are considering.",
        months: "months",
        monthsShort: "mo",
      },
      income: {
        label: "Income",
        title: "What is your monthly income?",
        subtitle:
          "Net income helps us match products with published minimums.",
        inputLabel: "Net monthly income",
        hint: "We use this only to check compatibility. It is not a credit check.",
      },
      employment: {
        label: "Employment",
        title: "What do you do?",
        subtitle: "Choose what best describes you.",
      },
      debt: {
        label: "Debt",
        title: "Do you have other monthly credit payments?",
        yes: "Yes",
        no: "No",
        paymentLabel: "How much do you pay in total per month?",
      },
      contact: {
        label: "Contact",
        title: "Where should we send the results?",
        subtitle:
          "We use this to send your options and to pass to a partner only if you continue.",
        nameLabel: "Name",
        namePlaceholder: "Full name",
        phoneLabel: "Phone",
        emailLabel: "Email",
        emailInvalid: "Please enter a valid email address.",
      },
      consent: {
        label: "Consent",
        title: "You decide what you share.",
        subtitle:
          "To show you relevant options, we need to process the information you provide.",
        platformLabel: "I agree to Veyra processing my information",
        platformDesc: "Required so we can process your request.",
        partnerLabel:
          "I agree that Veyra may share my application information with the financial partners I select on the results page, so they can assess whether they can offer me financing",
        partnerListPrefix: "See who the partners are:",
        partnerListLink: "partner list",
        ageNotice: "The service is intended for people aged 18 and over.",
        partnerDesc:
          "Your data is passed only to the partners you choose yourself — not to all of them at once. Each partner is an independent data controller.",
        marketingLabel: "I want to receive useful updates from Veyra",
        marketingDesc: "Optional. You can unsubscribe at any time.",
        legalPrefix: "By continuing you accept our",
        terms: "terms",
        and: "and",
        privacy: "privacy policy",
        legalSuffix: ".",
        submit: "See my options",
        submitting: "Finding options…",
        error: "Something went wrong. Please try again.",
      },
    },
    employmentOptions: {
      employed: "Employed",
      self_employed: "Self-employed",
      business_owner: "Business owner",
      pensioner: "Pensioner",
      other: "Other",
    },
    validation: {
      amountRequired: "Please choose an amount.",
      termRequired: "Please choose a term.",
      incomeRequired: "Please enter your monthly income.",
      nameRequired: "Please enter your name.",
    },
  },
  calculator: {
    eyebrow: "Credit calculator",
    title: "Estimate your monthly payment and total cost.",
    intro:
      "Enter an amount, term and indicative annual interest to see an example monthly payment and total cost. The result is indicative — exact terms are set by the partner.",
    amount: "Amount",
    term: "Term",
    months: "months",
    rate: "Annual interest (indicative)",
    monthly: "Example monthly payment",
    totalRepay: "Total to repay",
    totalCost: "Total cost of credit",
    cta: "See relevant options",
    disclaimer:
      "Indicative annuity estimate. Not an offer and excludes fees or APR. Final terms are set by the respective lender.",
    aprCapRef: "Statutory APR cap in Bulgaria:",
    seoHeading: "How to read the result",
    seoBody:
      "The monthly payment is what you pay each month. Total cost is the difference between the amount repaid and the amount borrowed. When comparing real offers, look at the APR, which also includes fees.",
  },
  // --- Mandatory legal / regulatory strings --------------------------------
  // See the Bulgarian catalog for the authoritative comment. Labels only.
  // See the Bulgarian catalog for the authoritative comment (ЗЗП чл. 47а).
  ranking: {
    eyebrow: "Transparency",
    title: "How we rank offers",
    intro:
      "Veyra orders the options you see, so we think it is right to explain exactly which parameters determine that order — and where a commercial interest exists.",
    paramsTitle: "What determines the order",
    paramsIntro:
      "Every suitable option is given a compatibility score from 0 to 100, calculated from the following factors with the weights shown:",
    params: [
      {
        label: "Requested amount (25%)",
        body: "How well the amount you requested sits within the product's range. An amount near the middle of the range scores higher than one at the very edge.",
      },
      {
        label: "Requested term (20%)",
        body: "The same logic for the repayment term against the product's range.",
      },
      {
        label: "Income against the minimum (20%)",
        body: "How far the income you stated exceeds the product's published minimum.",
      },
      {
        label: "Employment type (20%)",
        body: "How the employment type you stated relates to the product's requirements.",
      },
      {
        label: "Product suitability (15%)",
        body: "How well the product type matches the purpose you stated.",
      },
    ],
    orderTitle: "The display order",
    orderBody:
      "Options are ordered by compatibility score, highest first.",
    commercialTitle: "Do our commercial arrangements influence this",
    commercialBody:
      "Yes, but only on a tie. When two options receive the same compatibility score, their order is decided by a priority value Veyra sets for each partner and product. That value may reflect our commercial agreement with the partner. It cannot outrank a higher compatibility score — it only orders equal results.",
    moneyTitle: "How Veyra is paid",
    moneyBody:
      "We are paid by the partners, not by you. If you continue to a partner and are subsequently approved, the partner may pay us a commission. The service is free for you and there is no mark-up on the partner's terms.",
    notLenderTitle: "Veyra is not a lender",
    notLenderBody:
      "We do not lend money and do not make approval decisions. The compatibility score reflects a match against a partner's published criteria — it is not a credit score and not a probability of approval. The final decision and terms are set entirely by the relevant partner.",
    notUsedTitle: "What we do not use",
    notUsed: [
      "We do not perform a credit assessment and do not query the ЦКР credit register.",
      "We do not use hidden factors beyond those listed above.",
      "We do not accept payment to place an option above an objectively more suitable one.",
    ],
    footnote:
      "If any of these parameters change, this page is updated alongside them.",
  },
  cookieBanner: {
    title: "Cookies",
    body: "We use essential cookies to make the site work. With your consent we would also use analytics cookies to improve it. Without consent, no analytics scripts are loaded at all.",
    policyLink: "Cookie policy",
    accept: "Accept analytics",
    reject: "Essential only",
  },
  prelaunch: {
    cta: "Credit calculator",
    eyebrow: "Coming soon",
    title: "We are not accepting requests yet.",
    body:
      "Veyra is preparing to launch. Until our partner agreements are finalised we are not accepting credit requests.",
    noData:
      "We collect no personal data on this page — there is no form, and we are not asking for an email or phone number.",
    meanwhileTitle: "In the meantime",
    calculatorCta: "Work out a monthly payment",
    guidesCta: "Read the guides",
    closingTitle: "Work out your monthly payment",
    closingBody:
      "We are not accepting requests yet. Until then the calculator shows the monthly payment and the total repayable for a given amount and term.",
    notALender: "Veyra is not a lender. We do not lend money or make approval decisions.",
  },
  legal: {
    warningAria: "Mandatory warning",
    warningGloss: "Warning! Taking out credit costs money.",
    warningGlossNote: "Statutory wording, binding in Bulgarian",
    notALender: "Veyra is not a lender. The final decision is made by the partner.",
    freeForYou: "The service is free for you. We are paid by the partners.",
    minAge: "The service is available to people aged 18 and over.",
    disclosuresTitle: "Mandatory information",
    disclosuresIntro:
      "Information about our partners' credit products. Veyra is not a lender — the specific terms are set by the relevant partner.",
    termRangeLabel: "Repayment period",
    termRangeValue: "from {min} to {max} months",
    maxAprLabel: "Maximum APR",
    aprCapLabel: "Statutory APR cap",
    aprCapNote: "5 x the statutory default interest rate. Reset on 1 January and 1 July.",
    feesLabel: "Applicable fees",
    addressLabel: "Registered address",
    representativeTitle: "Representative example",
    representativeExample:
      "Representative example: for an amount of {amount} EUR, a term of {term} months, a fixed annual borrowing rate of {rate}%, APR {apr}%, total amount repayable {total} EUR, monthly instalment {monthly} EUR.",
    unfilledNotice:
      "MANDATORY INFORMATION NOT FILLED IN — this page must not be published or advertised until the values are supplied. See TODO-LEGAL.md.",
    pendingNotice:
      "The company is being registered. The mandatory values will be published before the site goes live.",
    productsTitle: "Partner products",
    productsIntro:
      "Product and legal information for each partner, confirmed against the partner's official documents.",
    productMaxAprLabel: "Product maximum APR",
    noFeesConfirmed: "No additional fees (confirmed by the partner).",
    updatedLabel: "Information last updated on {date}.",
    identityTitle: "Company identification",
    companyLabel: "Company",
    eikLabel: "Company no.",
    vatLabel: "VAT no.",
    addressShortLabel: "Address",
    phoneLabel: "Phone",
    emailLabel: "Email",
  },
  results: {
    eyebrow: "Results",
    title: "We found relevant options.",
    titleMultiple: "We found several relevant options.",
    subhead:
      "Based on the information you provided. Review the options and choose which partners to continue with.",
    countSuffix: "relevant options",
    compatibilityExplainer:
      "The indicator reflects the match against the partner's pre-set criteria. It is not an approval probability.",
    matchSuffix: "match with the criteria",
    topMatch: "Highest compatibility with your entered criteria",
    suitable: "Suitable based on the data you entered",
    compatibilityLabel: "Compatibility",
    confirmTitlePrefix: "Continuing to ",
    confirmBody:
      "We will share the necessary information with the selected partner according to the consent you gave. You are leaving Veyra and continuing to the partner's site.",
    confirmCtaPrefix: "Continue to ",
    back: "Back",
    selectLabel: "Select",
    selectedLabel: "Selected",
    continueSelected: "Continue with selected",
    selectHint: "Select one or more partners to continue with.",
    confirmMultiTitle: "Confirm your selection",
    confirmMultiBody:
      "We will create a referral to the selected partners according to the consent you gave.",
    confirmMultiCta: "Confirm",
    processing: "Processing…",
    successTitle: "Done — your application has been processed.",
    successSubhead: "We found relevant options based on the information you provided.",
    successSelected: "Selected partners",
    openPartner: "Continue to partner",
    successDisclaimer:
      "Veyra is not a lender and does not guarantee approval. The final decision is made by the respective partner.",
    amountRange: "Amount",
    termRange: "Term",
    months: "months",
    continueToPartner: "Continue to partner",
    opening: "Opening…",
    emptyHeadline: "There are no suitable options right now.",
    emptySubhead:
      "Based on the information you entered, we did not find a partner whose criteria match your profile. You can adjust your request and try again.",
    emptyTitle: "No relevant options right now",
    emptyBody:
      "Based on the information you entered, we did not find any suitable options. You can adjust your request and try again.",
    adjust: "Adjust request",
    disclaimer:
      "Veyra is not a lender. The final decision and terms are set by the respective partner.",
    loadError: "We could not load your options. Please try again.",
    noReference: "No application reference was provided.",
    routeError: "We could not open the partner link. Please try again.",
    loading: "Loading…",
    productTypes: {
      SHORT_TERM_LOAN: "Short-term loan",
      CONSUMER_LOAN: "Consumer loan",
      REFINANCING: "Refinancing",
      DEBT_CONSOLIDATION: "Debt consolidation",
      CREDIT_CARD: "Credit card",
      OTHER: "Loan",
    },
    reasons: {
      amount_in_range: "Requested amount fits the product range.",
      amount_out_of_range:
        "Requested amount is outside the range ({min}–{max} {currency}).",
      term_in_range: "Requested term fits the product range.",
      term_out_of_range:
        "Requested term is outside the range ({min}–{max} months).",
      income_meets_min: "Your stated income meets the published minimum.",
      income_below_min:
        "Stated income is below the published minimum for this product.",
      rule_pass: "Your profile meets this product's requirement.",
      rule_fail: "Your profile does not meet this product's requirement.",
    },
  },
};

export default en;
