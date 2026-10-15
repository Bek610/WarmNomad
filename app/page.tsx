import OrderForm from "./OrderForm";
import StickyCta from "./StickyCta";
import {
  FAQ,
  MARKET_PRICE_TEXT,
  PACKAGES,
  PREPAY_DISCOUNT,
  REVIEWS,
  SITE,
  SPECS,
  formatMNT,
} from "@/lib/config";

const PROBLEMS = [
  {
    icon: "🩸",
    title: "Буйл цус гардаг",
    problem: "Шүдээ угаахад буйл цус гарч, хавдаад байна уу?",
    solution: "Зөөлөн, даралттай ус буйлны шугамыг сойз шиг үрэлгүйгээр цэвэрлэнэ.",
  },
  {
    icon: "🦷",
    title: "Брекеттэй",
    problem: "Брекетийн утасны завсарт хоол гацаад сойз хүрэхгүй байна уу?",
    solution: "Нарийн хошуу брекетийн завсар, бэхэлгээний доогуур амархан ордог.",
  },
  {
    icon: "💨",
    title: "Амны эвгүй үнэр",
    problem: "Шүдээ угаасан ч амнаас эвгүй үнэр гараад байна уу?",
    solution: "Завсарт үлдсэн хоолны үлдэгдэл болон хэлний өнгөрийг угааж цэвэрлэнэ.",
  },
];

const STEPS = [
  { n: "1", title: "Ус хий", text: "300 мл саванд бүлээн ус хийнэ." },
  { n: "2", title: "Горимоо сонго", text: "5 түвшнээс өөрт тохирохыг сонгоно. Анх удаа бол сул горимоор." },
  { n: "3", title: "1–2 минут", text: "Шүдний завсар, буйлны шугам дагуу явуулна. Өдөрт нэг удаа." },
];

export default function Home() {
  const minPrice = Math.min(...PACKAGES.filter((p) => p.available).map((p) => p.price));

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <span className="logo">{SITE.brand}</span>
          <span className="pill">Үнэгүй хүргэлт</span>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{SITE.productName}</p>
              <h1>Сойз хүрдэггүй завсрыг ус цэвэрлэнэ</h1>
              <p className="lead">
                Даралттай усан урсгал шүдний завсар, буйлны шугам, брекетийн дундах хоолны үлдэгдлийг
                1–2 минутад угаана. Цэнэглэдэг, утасгүй, аялалд авч явахад хялбар.
              </p>
              <div className="price-row">
                <span className="price-now">{formatMNT(minPrice)}</span>
                <span className="price-was">Зах зээлд {MARKET_PRICE_TEXT}</span>
              </div>
              <a href="#order" className="btn btn-primary">
                Захиалах
              </a>
              <ul className="chips">
                <li>🚚 УБ-т үнэгүй хүргэлт</li>
                <li>💵 Хүргэлтээр төлөх боломжтой</li>
                <li>🔁 Гэмтэлтэй бол 7 хоногт солино</li>
              </ul>
            </div>
            <div className="hero-media">
              {SITE.heroVideo ? (
                <video className="media" src={SITE.heroVideo} autoPlay muted loop playsInline />
              ) : SITE.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="media" src={SITE.heroImage} alt={SITE.productName} />
              ) : (
                <div className="media-ph" role="img" aria-label="Бүтээгдэхүүний зураг">
                  <span>Бүтээгдэхүүний зураг / видео</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PROBLEM → SOLUTION */}
        <section className="section">
          <div className="wrap">
            <h2>Танд аль нь тохиолдож байна вэ?</h2>
            <div className="cards">
              {PROBLEMS.map((p) => (
                <article className="card" key={p.title}>
                  <span className="card-icon" aria-hidden="true">
                    {p.icon}
                  </span>
                  <h3>{p.title}</h3>
                  <p className="muted">{p.problem}</p>
                  <p className="solution">→ {p.solution}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section section-tint">
          <div className="wrap">
            <h2>Хэрэглэхэд маш амархан</h2>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="step-n">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p className="muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <dl className="specs">
              {SPECS.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PRICE COMPARISON */}
        <section className="section">
          <div className="wrap">
            <h2>Яагаад манайхаас авах вэ?</h2>
            <div className="compare">
              <div className="compare-col">
                <h3>Зах зээл дээр</h3>
                <p className="compare-price">{MARKET_PRICE_TEXT}</p>
                <ul>
                  <li>Ижил төстэй зөөврийн flosser-ийн дэлгүүрийн үнэ</li>
                </ul>
              </div>
              <div className="compare-col compare-ours">
                <h3>{SITE.brand}</h3>
                <p className="compare-price">{formatMNT(minPrice)}-с</p>
                <ul>
                  <li>УБ-т үнэгүй хүргэлт</li>
                  <li>Хүргэлтээр төлөх боломжтой</li>
                  <li>Урьдчилж төлбөл −{formatMNT(PREPAY_DISCOUNT)}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS — only real ones, hidden while empty */}
        {REVIEWS.length > 0 && (
          <section className="section section-tint">
            <div className="wrap">
              <h2>Худалдан авагчдын сэтгэгдэл</h2>
              <div className="cards">
                {REVIEWS.map((r, i) => (
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
            <OrderForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="wrap wrap-narrow">
            <h2>Түгээмэл асуулт</h2>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <p>
            © {new Date().getFullYear()} {SITE.brand}
            {SITE.phone && <> · {SITE.phone}</>}
          </p>
          <a href={SITE.messengerUrl} target="_blank" rel="noopener noreferrer">
            Messenger-ээр холбогдох
          </a>
        </div>
      </footer>

      <StickyCta label={`Захиалах · ${formatMNT(minPrice)}`} />
    </>
  );
}
