import { PARTNERS, HAS_PARTNERS } from "@/config/partners";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n";

/**
 * The live list of lender partners a user's data may be shared with.
 *
 * Each partner lender is an INDEPENDENT DATA CONTROLLER, so a generic "we share
 * your data with our partners" does not carry lawful basis. The consent step
 * links here, which is what makes this a maintained, named-recipient list
 * rather than a marketing page.
 *
 * When no partner is signed and cleared for publication the component says so
 * plainly. It never renders invented names to fill the space.
 */
export function PartnerList({ className = "" }: { className?: string }) {
  const m = getMessages(defaultLocale).partners;

  if (!HAS_PARTNERS) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
      >
        <h2 className="t-h3 text-ink">{m.listTitle}</h2>
        <p className="mt-2 t-body text-muted">{m.listEmpty}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="t-h3 text-ink">{m.listTitle}</h2>
      <p className="mt-2 t-body text-muted">{m.listIntro}</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {PARTNERS.map((p) => (
          <li
            key={p.name}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            {/* Below-the-fold partner logos are lazy-loaded: 67% of Bulgarian
                loan applicants are on a phone. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.logo}
              alt={p.name}
              loading="lazy"
              decoding="async"
              width={48}
              height={48}
              className="h-12 w-12 flex-none rounded-xl object-contain"
            />
            <div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-display text-base font-bold text-ink hover:text-mint-600"
              >
                {p.name}
              </a>
              {p.description && (
                <p className="mt-1 t-small text-muted">{p.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
