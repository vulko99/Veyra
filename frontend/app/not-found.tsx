import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страницата не е намерена | Veyra",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 grid-lines mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 atmos-light" />
      <div className="container-x max-w-xl py-24 text-center sm:py-32">
        <span className="eyebrow justify-center">404</span>
        <h1 className="t-h1 mt-4 text-ink">Страницата не е намерена</h1>
        <p className="mt-4 t-body text-muted">
          Възможно е връзката да е остаряла или страницата да е преместена.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-mint">
            Към началото<span aria-hidden>→</span>
          </Link>
          <Link href="/kalkulator" className="btn-ghost">
            Кредитен калкулатор
          </Link>
        </div>
      </div>
    </div>
  );
}
