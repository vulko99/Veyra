// The results page once rendered `home.viz.requestValue` — the fixed marketing
// motif "€2 000 · 12 месеца" — under the "Твоята заявка" / "Your request"
// label, so an applicant who asked for €3000 over 24 months was shown someone
// else's numbers as their own. On a regulated financial-intermediation product
// that misstates the user's request back to them on the decision page. These
// rules stop that shape of mistake from coming back.

const REQUEST_VALUE_MESSAGE =
  "home.viz.requestValue is hardcoded marketing copy, not applicant data. " +
  "Render the real request from the application (desired_amount_eur / " +
  "desired_term_months) via formatEUR and the `months` key. It is allowed " +
  "only in MatchingViz and how-it-works, where the motif is illustrative.";

module.exports = {
  extends: "next/core-web-vitals",
  overrides: [
    {
      // Allowed only in the two decorative illustrations, which depict a
      // hypothetical request and are not tied to any applicant.
      files: ["**/*.ts", "**/*.tsx"],
      // Route files live under app/[locale]/ since locales moved into the URL.
      // Matched with a glob rather than a literal path so the allowlist cannot
      // silently stop applying if the segment is ever renamed again — a rule
      // that quietly matches nothing is worse than no rule.
      excludedFiles: [
        "components/MatchingViz.tsx",
        "app/**/how-it-works/page.tsx",
      ],
      rules: {
        "no-restricted-syntax": [
          "error",
          // Matches `v.requestValue` as well as `m.home.viz.requestValue`:
          // the property name is what survives aliasing.
          {
            selector: "MemberExpression[property.name='requestValue']",
            message: REQUEST_VALUE_MESSAGE,
          },
          {
            selector: "MemberExpression[property.value='requestValue']",
            message: REQUEST_VALUE_MESSAGE,
          },
        ],
      },
    },
    {
      // The funnel exists to collect and reflect the applicant's own answers.
      // The landing-page matching motif has no business there at all, so block
      // the whole `viz` block rather than one key of it.
      files: ["app/apply/**/*.tsx"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "MemberExpression[object.property.name='home'][property.name='viz']",
            message:
              "home.viz is decorative landing-page copy. Funnel steps must render " +
              "the applicant's own draft values, never the marketing motif.",
          },
        ],
      },
    },
  ],
};
