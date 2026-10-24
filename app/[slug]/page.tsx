import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderForm from "../OrderForm";
import StickyCta from "../StickyCta";
import Gallery from "../Gallery";
import FaqVideo from "../FaqVideo";
import { Footer, Header, ProductCard, TRUST } from "../Shell";
import { COMMON_FAQ, PREPAY_DISCOUNT, SITE, formatMNT } from "@/lib/config";
import { type Faq, getProduct, liveProducts, mainPrice } from "@/lib/products";
import { getStock, packageLeft } from "@/lib/stock";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return liveProducts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;
export const revalidate = 60; // үлдэгдэл минут тутам шинэчлэгдэнэ

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} | ${SITE.brand}`,
    description: p.hero.lead.slice(0, 155),
    openGraph: { title: `${p.name} | ${SITE.brand}`, images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Params) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const stock = await getStock();

  const pkgs = p.packages.filter((k) => k.available);
  const main = pkgs.find((k) => k.id === p.mainPackageId) ?? pkgs[0];
  const others = pkgs.filter((k) => k.id !== main.id);
  const related = liveProducts().filter((x) => x.slug !== p.slug);
  // Барааны асуултын дараа ерөнхий асуултууд (давхардлыг алгасна)
  const faq: Faq[] = [...p.faq, ...COMMON_FAQ.filter((c) => !p.faq.some((f) => f.q === c.q))];

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{p.hero.eyebrow}</p>
              <h1>{p.hero.title}</h1>
              <p className="lead">{p.hero.lead}</p>
              <ul className="inbox">
                {p.inTheBox.map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
              <div className="price-row">
                <span className="price-now">{formatMNT(main.price)}</span>
                <span className="price-was">
                  {main.title}
                  {p.compare ? ` · Зах зээлд ${p.compare.marketText}` : ""}
                </span>
              </div>
              {(() => {
                const n = packageLeft(main.uses, stock);
                if (n === null) return null;
                return (
                  <p className={`hero-stock ${n === 0 ? "is-out" : n <= 5 ? "is-low" : ""}`}>
                    {n === 0 ? "Түр дууссан" : `Үлдэгдэл: ${n} ширхэг`}
                  </p>
                );
              })()}
              {others.length > 0 && (
                <p className="price-alt">
                  Мөн: {others.map((k) => `${k.title} ${formatMNT(k.price)}`).join(" · ")}
                </p>
              )}
              <a href="#order" className="btn btn-primary">
                Захиалах
              </a>
              <ul className="chips">
                {TRUST.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="hero-media">
              <Gallery images={p.images} video={p.video} alt={p.name} />
            </div>
          </div>
        </section>

        {/* PROBLEM → SOLUTION */}
        <section className="section">
          <div className="wrap">
            <h2>{p.problemsTitle}</h2>
            <div className="cards">
              {p.problems.map((x) => (
                <article className="card" key={x.title}>
                  <span className="card-icon" aria-hidden="true">
                    {x.icon}
                  </span>
                  <h3>{x.title}</h3>
                  <p className="muted">{x.problem}</p>
                  <p className="solution">→ {x.solution}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO USE + SPECS */}
        <section className="section section-tint">
          <div className="wrap">
            <h2>{p.stepsTitle}</h2>
            <ol className="steps">
              {p.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="step-n">{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p className="muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <h3 className="specs-title">Материал, үзүүлэлт</h3>
            <dl className="specs">
              {p.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PRICE COMPARISON (optional) */}
        {p.compare && (
          <section className="section">
            <div className="wrap">
              <h2>Яагаад манайхаас авах вэ?</h2>
              <div className="compare">
                <div className="compare-col">
                  <h3>Зах зээл дээр</h3>
                  <p className="compare-price">{p.compare.marketText}</p>
                  <ul>
                    <li>{p.compare.marketNote}</li>
                  </ul>
                </div>
                <div className="compare-col compare-ours">
                  <h3>{SITE.brand}</h3>
                  <p className="compare-price">{formatMNT(mainPrice(p))}</p>
                  <ul>
                    {p.compare.ours.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                    <li>Урьдчилж төлбөл −{formatMNT(PREPAY_DISCOUNT)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* REVIEWS — only real ones, hidden while empty */}
        {p.reviews.length > 0 && (
          <section className="section section-tint">
            <div className="wrap">
              <h2>Худалдан авагчдын сэтгэгдэл</h2>
              <div className="cards">
                {p.reviews.map((r, i) => (
                  <blockquote className="card review" key={i}>
                    <p>“{r.text}”</p>
                    <cite>— {r.name}</cite>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ORDER */}
        <section className="section section-order" id="order">
          <div className="wrap wrap-narrow">
            <h2>Захиалга өгөх</h2>
            <p className="muted center">1 минут л болно. Бид утсаар холбогдож баталгаажуулна.</p>
            <OrderForm
              productSlug={p.slug}
              productName={p.name}
              packages={p.packages}
              defaultPackageId={p.mainPackageId}
              stock={stock}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="wrap wrap-narrow">
            <h2>Түгээмэл асуулт</h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                  {f.videos && f.videos.length > 0 && (
                    <div className="faq-videos">
                      <span className="faq-videos-label">Видеогоор үзэх:</span>
                      {f.videos.map((v, i) => (
                        <FaqVideo key={v} src={v} index={i + 1} />
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* OTHER PRODUCTS */}
        {related.length > 0 && (
          <section className="section section-tint">
            <div className="wrap">
              <h2>Бусад бараа</h2>
              <div className="shop-grid">
                {related.map((r) => (
                  <ProductCard key={r.slug} p={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <StickyCta label={`Захиалах · ${formatMNT(main.price)}`} />
    </>
  );
}
