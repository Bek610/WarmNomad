import { COMMON_FAQ, SITE } from "@/lib/config";
import { liveProducts } from "@/lib/products";
import { Footer, Header, ProductCard, TRUST } from "./Shell";

// Нүүр хуудас: дэлгүүрийн каталог
export default function Home() {
  const products = liveProducts();

  return (
    <>
      <Header />
      <main>
        <section className="hero hero-shop">
          <div className="wrap">
            <h1>{SITE.tagline}</h1>
            <p className="lead">Улаанбаатарт үнэгүй хүргэнэ. Бараагаа хүлээн аваад төлнө.</p>
            <ul className="chips">
              {TRUST.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <svg className="hero-ridge" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 90 L0 62 L120 40 L230 58 L360 18 L470 50 L600 30 L720 64 L850 22 L980 54 L1110 34 L1240 60 L1350 26 L1440 46 L1440 90 Z" />
          </svg>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>Манай бараа</h2>
            <div className="shop-grid">
              {products.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tint">
          <div className="wrap wrap-narrow">
            <h2>Түгээмэл асуулт</h2>
            <div className="faq">
              {COMMON_FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
