// English message catalog — prepared for future expansion.
// Must match the shape of the Bulgarian (default) catalog.
import type { Messages } from "./bg";

const en: Messages = {
  meta: {
    title: "Veyra — Find financial options that fit you",
    description:
      "Tell us what you need and explore relevant options from our financial partners through one simple application. Veyra is a marketplace and does not lend money itself.",
  },
  common: {
    brand: "Veyra",
    checkOptions: "Check your options",
    back: "Back",
    continue: "Continue",
    start: "Start",
    marketplaceShort: "Veyra is a marketplace and does not make lending decisions.",
    noGuarantee:
      "Veyra does not guarantee approval. The final decision is made by the lender.",
  },
  nav: {
    howItWorks: "How it works",
    loans: "Loans",
    faq: "FAQ",
    responsible: "Responsible borrowing",
    menu: "Menu",
  },
  footer: {
    tagline:
      "Veyra is a financial marketplace. We help you discover relevant options from our partners. We do not lend money and we do not make credit decisions.",
    productTitle: "Product",
    companyTitle: "Company",
    legalTitle: "Legal",
    links: {
      howItWorks: "How it works",
      loans: "Loans",
      checkOptions: "Check your options",
      faq: "FAQ",
      contact: "Contact",
      responsible: "Responsible borrowing",
      privacy: "Privacy policy",
      terms: "Terms of use",
    },
    rights: "All rights reserved.",
    bottomNote:
      "The final lending decision is always made by the lender. Borrowing has costs — please borrow responsibly.",
  },
  home: {
    badge: "A financial marketplace, not a lender",
    h1: "Find financial options that fit you.",
    subhead:
      "Tell us what you need and explore relevant options from our financial partners through one simple application.",
    illustrationTag: "Illustration",
    yourRequest: "Your request",
    amount: "Amount",
    term: "Term",
    termValue: "24 months",
    relevantOptions: "Relevant options",
    relevantOptionsValue: "3 found",
    partnerPlaceholder:
      "Partner logos appear here once permissions are in place. We never display partners we are not authorised to show.",
    trust: [
      { stat: "1", label: "simple application" },
      { stat: "0", label: "impact from browsing options" },
      { stat: "100%", label: "your choice which partner to continue with" },
    ],
    stepsTitle: "Three simple steps",
    stepsIntro:
      "Veyra brings clarity to a fragmented market. One application, relevant options, your decision.",
    steps: [
      {
        title: "Tell us what you need",
        body: "Share a few details about the amount, term, and your situation. One short application, no account required.",
      },
      {
        title: "We find relevant options",
        body: "Our matching engine compares your information against our partners' published criteria — not a credit score.",
      },
      {
        title: "You choose a partner",
        body: "Review the options that appear relevant and continue to a partner. They make the final decision.",
      },
    ],
    ctaTitle: "Ready to explore your options?",
    ctaBody:
      "It takes a few minutes and there is no obligation to continue with any partner.",
  },
  howItWorks: {
    title: "How Veyra works",
    intro:
      "Veyra is a marketplace that connects you with relevant financial partners. Here is exactly what happens with your information.",
    sections: [
      {
        heading: "1. You complete one application",
        body: "You tell us the amount and term you are considering, along with a few details about your situation. No password or account is required, and you can go back and edit any step.",
      },
      {
        heading: "2. You give explicit consent",
        body: "Before anything is shared, you decide what you agree to. Consent to platform processing and to sharing your data with partners is required to show you options. Marketing is always separate and optional.",
      },
      {
        heading: "3. Our matching engine finds relevant options",
        body: "We compare your information against each partner's published product criteria — such as amount ranges, term ranges, and minimum income. This is a compatibility check, not a credit score and not a prediction of approval.",
      },
      {
        heading: "4. You choose whether to continue",
        body: "You see the options that appear relevant and can continue to a partner if you wish. The partner runs its own process and makes the final decision. You are never obliged to proceed.",
      },
      {
        heading: "How Veyra makes money",
        body: "When you choose to continue to a partner and go on to be approved or funded, that partner may pay Veyra a fee. This never changes the options we show you or adds cost to you.",
      },
    ],
  },
  loans: {
    title: "Loan options through our partners",
    intro:
      "Veyra does not lend money. We surface relevant products from our financial partners so you can compare and choose.",
    products: [
      {
        name: "Short-term loans",
        body: "Smaller amounts over shorter periods. Useful for time-sensitive needs where a compact repayment schedule fits.",
      },
      {
        name: "Consumer loans",
        body: "Mid-sized amounts over longer terms, for planned purchases, home improvements, or consolidating what you already owe.",
      },
      {
        name: "Refinancing & consolidation",
        body: "Options that may help you reorganise existing borrowing into a single, clearer arrangement.",
      },
    ],
    neverTitle: "What we never do",
    neverList: [
      "We do not guarantee approval or promise a specific rate.",
      "We do not present partners we are not authorised to display.",
      "We do not make the final lending decision — the lender does.",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Is Veyra a lender?",
        a: "No. Veyra is a marketplace. We connect you with relevant financial partners. We do not lend money and we do not make credit decisions.",
      },
      {
        q: "Does checking my options affect anything?",
        a: "Completing the Veyra application to see relevant options does not itself involve a lender decision. If you choose to continue to a partner, that partner runs its own process.",
      },
      {
        q: "Do you guarantee I will be approved?",
        a: "No. We never guarantee approval and we never promise a specific rate. The options we show are based on the information you provide and each partner's published criteria.",
      },
      {
        q: "Do I need to create an account?",
        a: "No account or password is required to apply. We keep the amount of personal data we collect to a minimum.",
      },
      {
        q: "What does the match score mean?",
        a: "It is an internal compatibility score — how well your request fits a product's published criteria. It is not a credit score and not a probability of approval.",
      },
      {
        q: "How does Veyra make money?",
        a: "When you choose to continue to a partner and are subsequently approved or funded, that partner may pay Veyra a fee. This does not add cost to you.",
      },
    ],
  },
  responsible: {
    title: "Responsible borrowing",
    intro:
      "Borrowing has real costs. We want you to make a decision that is right for your situation.",
    sections: [
      {
        heading: "Borrow only what you need",
        body: "Consider the total cost of borrowing, not just the monthly payment. A longer term can lower monthly payments but increase what you pay overall.",
      },
      {
        heading: "Check you can afford the repayments",
        body: "Look at your income and existing commitments. Make sure repayments fit comfortably alongside your essential expenses.",
      },
      {
        heading: "Read the partner's terms",
        body: "Any agreement you enter is with the partner, not Veyra. Read their terms, interest rate, fees, and conditions carefully before signing.",
      },
      {
        heading: "If you are struggling",
        body: "If you are worried about debt, consider speaking with a qualified, independent financial adviser or a consumer support organisation before taking on new borrowing.",
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "This summary explains, in plain language, how Veyra handles your data. It is not a substitute for the full legal policy, which will be published before launch.",
    sections: [
      {
        heading: "Data minimisation",
        body: "We collect only what we need to show you relevant options. We do not require an account, and we store request metadata such as IP address and device only as one-way hashes — never in raw form.",
      },
      {
        heading: "Consent",
        body: "We process and share your data based on the explicit, versioned consent you give. Marketing consent is always separate and optional. You can decline sharing and simply not proceed.",
      },
      {
        heading: "Sharing with partners",
        body: "If you choose to continue to a partner, relevant application details are shared with that partner so they can process your enquiry. We only share with partners you choose to continue to.",
      },
      {
        heading: "Retention",
        body: "We keep personal data only as long as necessary and anonymise records past our retention window. An audit trail of key events is maintained for accountability.",
      },
      {
        heading: "Your rights",
        body: "Subject to applicable law, you may request access to, correction of, or deletion of your personal data. Contact us via the contact page.",
      },
    ],
    footNote:
      "Policy version reference is recorded with each consent you provide.",
  },
  terms: {
    title: "Terms of use",
    intro:
      "This is a plain-language summary of how Veyra operates. Full legal terms will be published before launch.",
    sections: [
      {
        heading: "What Veyra is",
        body: "Veyra is a financial marketplace. We help you discover relevant options from our partners. We are not a lender, we do not provide credit, and we do not make lending decisions.",
      },
      {
        heading: "No guarantee",
        body: "Showing an option does not mean you will be approved. Approval, pricing, and terms are determined solely by the partner.",
      },
      {
        heading: "Your responsibilities",
        body: "You agree to provide accurate information and to review any partner agreement carefully. Any credit agreement is between you and the partner.",
      },
      {
        heading: "Changes",
        body: "We may update these terms. The version in force is recorded with each consent you provide.",
      },
    ],
  },
  contact: {
    title: "Contact us",
    intro:
      "We are happy to help with questions about how Veyra works or about your data.",
    generalTitle: "General enquiries",
    dataTitle: "Data & privacy requests",
    emailLabel: "Email:",
    note: "Contact addresses are placeholders for the MVP and will be finalised before launch.",
  },
  apply: {
    intro: {
      h1: "Let's find options that fit you",
      sub: "This takes a few minutes. There is no account to create and no obligation to continue with any partner.",
      bullets: [
        "One short application",
        "Relevant options based on what you tell us",
        "You decide whether to continue to a partner",
      ],
    },
    progress: "Step {current} of {total}",
    steps: {
      amount: {
        label: "Amount",
        title: "How much would you like to borrow?",
        subtitle: "Enter an amount in BGN. You can change this later.",
        inputLabel: "Amount (BGN)",
      },
      term: {
        label: "Term",
        title: "Over how long?",
        subtitle: "Choose the repayment period you are considering.",
        months: "months",
        customLabel: "Or enter a custom number of months",
      },
      income: {
        label: "Income",
        title: "What is your monthly income?",
        subtitle:
          "Your net monthly income helps us match products with published minimums.",
        inputLabel: "Net monthly income (BGN)",
        hint: "We use this only to check compatibility with partner criteria. It is not a credit check.",
      },
      employment: {
        label: "Employment",
        title: "What is your employment situation?",
        monthsLabel: "How many months in your current situation? (optional)",
      },
      debt: {
        label: "Existing debt",
        title: "Do you have existing loans?",
        subtitle:
          "This helps partners assess affordability. You can skip the amounts if unsure.",
        yes: "Yes",
        no: "No",
        balanceLabel: "Total outstanding balance (BGN)",
        paymentsLabel: "Total monthly repayments (BGN)",
      },
      contact: {
        label: "Contact",
        title: "Where should partners reach you?",
        subtitle:
          "We use this to send your options and to pass to a partner only if you choose to continue.",
        purposeLabel: "What is the loan for? (optional)",
        emailLabel: "Email",
        emailInvalid: "Please enter a valid email address.",
        phoneLabel: "Phone (optional)",
      },
      consent: {
        label: "Consent",
        title: "Your consent",
        subtitle:
          "You decide what you agree to. Nothing is shared with partners unless you choose to continue to one.",
        platformLabel: "I agree to Veyra processing my information",
        platformDesc:
          "So we can show you relevant options. See our privacy policy.",
        partnerLabel:
          "I agree to my data being shared with a partner I choose to continue to",
        partnerDesc:
          "Your details are shared only with a partner you actively choose.",
        marketingLabel:
          "I would like to receive occasional updates from Veyra (optional)",
        marketingDesc: "Entirely optional. You can unsubscribe at any time.",
        legalPrefix: "By continuing you agree to our",
        terms: "terms",
        and: "and",
        privacy: "privacy policy",
        legalSuffix:
          ". Veyra does not guarantee approval; the final decision is made by the lender.",
        submit: "See my options",
        submitting: "Finding options…",
        error: "Something went wrong. Please try again.",
      },
    },
    employmentOptions: {
      FULL_TIME: "Full-time",
      PART_TIME: "Part-time",
      SELF_EMPLOYED: "Self-employed",
      CONTRACT: "Contract",
      RETIRED: "Retired",
      STUDENT: "Student",
      UNEMPLOYED: "Unemployed",
      OTHER: "Other",
    },
    purposeOptions: {
      MAJOR_PURCHASE: "Major purchase",
      HOME_IMPROVEMENT: "Home improvement",
      DEBT_CONSOLIDATION: "Consolidate debt",
      VEHICLE: "Vehicle",
      EMERGENCY: "Emergency",
      OTHER: "Other",
    },
    validation: {
      amountRequired: "Please enter an amount greater than zero.",
      termRequired: "Please choose a term.",
      incomeRequired: "Please enter your monthly income.",
    },
  },
  results: {
    eyebrow: "Your options",
    title: "Potentially relevant options",
    intro:
      "These options match the information you provided. Veyra is a marketplace — the final decision is made by the lender, not by Veyra.",
    appearsRelevant: "Appears relevant",
    amountRange: "Amount range",
    termRange: "Term range",
    type: "Type",
    months: "months",
    finalDecisionBy: "The final decision is made by {lender}.",
    continueToPartner: "Continue to partner",
    opening: "Opening…",
    emptyTitle: "No relevant options right now",
    emptyBody:
      "Based on what you told us, we did not find a relevant partner product at this time. You can adjust your request and try again.",
    adjust: "Adjust my request",
    disclaimer:
      "This is not an offer of credit. “Appears relevant” reflects compatibility with published criteria, not a probability of approval.",
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
      OTHER: "Other",
    },
    reasons: {
      amount_in_range: "Requested amount fits the product range.",
      amount_out_of_range:
        "Requested amount is outside the product range ({min}–{max} {currency}).",
      term_in_range: "Requested term fits the product range.",
      term_out_of_range:
        "Requested term is outside the product range ({min}–{max} months).",
      income_meets_min: "Your stated income meets the published minimum.",
      income_below_min:
        "Stated income is below the published minimum for this product.",
      rule_pass: "Your details meet this product's requirement.",
      rule_fail: "Your details do not meet this product's requirement.",
    },
  },
};

export default en;
