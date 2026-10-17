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
            <p className="eyebrow">{SITE.brand}</p>
            <h1>{SITE.tagline}</h1>
            <p className="lead">Улаанбаатарт үнэгүй хүргэнэ. Бараагаа хүлээн аваад төлнө.</p>
            <ul className="chips">
              {TRUST.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
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
