import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { locales } from "@/i18n/config";
import { localePath } from "@/lib/locale";

// Paths that must not be crawled in ANY locale. Expanded across every locale
// rather than listed once, because a disallow for `/apply` does not cover
// `/en/apply` — and the English twins of the funnel carry exactly the same
// in-progress personal data as the Bulgarian ones.
const PRIVATE_PATHS = ["/apply", "/results"];

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...locales.flatMap((locale) =>
      PRIVATE_PATHS.map((path) => localePath(locale, path))
    ),
    "/api/",
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The application funnel and results carry in-progress / personal data.
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
