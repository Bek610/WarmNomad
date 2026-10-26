import Link from "next/link";
import { SITE, formatMNT } from "@/lib/config";
import { type Product, mainPrice } from "@/lib/products";

export function Header() {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link href="/" className="logo">
          {SITE.brand}
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
          <span className="product-card-cta">Үзэх →</span>
        </div>
      </div>
    </Link>
  );
}

export const TRUST = ["🚚 УБ-т үнэгүй хүргэлт", "💵 Хүргэлтээр төлөх боломжтой", "🔁 Гэмтэлтэй бол 7 хоногт солино"];
