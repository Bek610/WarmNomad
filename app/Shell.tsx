import Link from "next/link";
import { SITE, formatMNT } from "@/lib/config";
import { type Product, mainPrice } from "@/lib/products";

// Лого: уул + ар талын оргил, голд нь гал асаж буй үүд
const DOOR = "M52 42 C57 54 61 64 61 80 L43 80 C43 64 47 54 52 42Z";
const FRONT = "M4 80 L52 20 L100 80Z";
export function LogoMark({ className = "logo-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="2 0 118 82" aria-hidden="true">
      <defs>
        <mask id="wn-door" maskUnits="userSpaceOnUse" x="-5" y="-5" width="130" height="94">
          <rect x="-5" y="-5" width="130" height="94" fill="#fff" />
          <path d={DOOR} fill="#000" stroke="#000" strokeWidth="6.5" />
        </mask>
        <mask id="wn-gap" maskUnits="userSpaceOnUse" x="-5" y="-5" width="130" height="94">
          <rect x="-5" y="-5" width="130" height="94" fill="#fff" />
          <path d={FRONT} fill="#000" stroke="#000" strokeWidth="7" strokeMiterlimit="10" />
        </mask>
      </defs>
      <path d="M24 80 L66 2.5 L118 80Z" fill="currentColor" mask="url(#wn-gap)" />
      <path d={FRONT} fill="currentColor" mask="url(#wn-door)" />
      <path d={DOOR} fill="#e5482c" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link href="/" className="logo">
          <LogoMark />
          <span className="logo-word">{SITE.brand}</span>
        </Link>
        <span className="pill">Үнэгүй хүргэлт</span>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <p>
          © {new Date().getFullYear()} {SITE.brand}
        </p>
        {SITE.phone && (
          <p>
            Холбогдох утас: <a href={`tel:+976${SITE.phone.replace(/\D/g, "")}`}>{SITE.phone}</a>
          </p>
        )}
        <a href={SITE.messengerUrl} target="_blank" rel="noopener noreferrer">
          Messenger-ээр холбогдох
        </a>
      </div>
    </footer>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const multi = p.packages.filter((k) => k.available).length > 1;
  const lowest = Math.min(...p.packages.filter((k) => k.available).map((k) => k.price));
  const main = mainPrice(p);
  return (
    <Link href={`/${p.slug}`} className="product-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.images[0]} alt={p.name} loading="lazy" />
      <div className="product-card-body">
        <h3>{p.card.title}</h3>
        <p className="muted">{p.card.text}</p>
        <div className="product-card-foot">
          <strong>{formatMNT(main)}</strong>
          {multi && lowest < main && <span className="muted small">{formatMNT(lowest)}-с</span>}
          <span className="product-card-cta">Дэлгэрэнгүй</span>
        </div>
      </div>
    </Link>
  );
}

export const TRUST = ["УБ-т үнэгүй хүргэлт", "Хүргэлтээр төлөх боломжтой", "Гэмтэлтэй бол 7 хоногт солино"];
