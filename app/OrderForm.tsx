"use client";

import { useMemo, useState } from "react";
import { AIMAGS, BANK, PREPAY_DISCOUNT, SITE, UB_DISTRICTS, formatMNT } from "@/lib/config";
import type { Pkg } from "@/lib/products";

type Location = "ub" | "countryside";
type Payment = "cod" | "prepay";

type Result = {
  orderId: string;
  amount: number;
  payment: Payment;
  packageTitle: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function OrderForm({
  productSlug,
  productName,
  packages,
  defaultPackageId,
}: {
  productSlug: string;
  productName: string;
  packages: Pkg[];
  defaultPackageId: string;
}) {
  const PACKAGES = packages.filter((p) => p.available);
  const [pkg, setPkg] = useState<string>(
    PACKAGES.find((p) => p.id === defaultPackageId)?.id ?? PACKAGES[0]?.id ?? ""
  );
  const [location, setLocation] = useState<Location>("ub");
  const [payment, setPayment] = useState<Payment>("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const effectivePayment: Payment = location === "countryside" ? "prepay" : payment;
  const selected = PACKAGES.find((p) => p.id === pkg)!;
  const total = useMemo(
    () => selected.price - (effectivePayment === "prepay" ? PREPAY_DISCOUNT : 0),
    [selected, effectivePayment]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Нэрээ бичнэ үү.");
    if (!/^[5-9]\d{7}$/.test(cleanPhone)) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    if (!area) return setError(location === "ub" ? "Дүүргээ сонгоно уу." : "Аймгаа сонгоно уу.");
    if (address.trim().length < 5) return setError("Хаягаа дэлгэрэнгүй бичнэ үү.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          packageId: pkg,
          location,
          payment: effectivePayment,
          name: name.trim(),
          phone: cleanPhone,
          area,
          address: address.trim(),
          note: note.trim(),
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа");
      setResult(data);
      window.fbq?.("track", "Lead", {
        value: data.amount,
        currency: "MNT",
        content_name: productName,
        content_category: productSlug,
      });
      window.scrollTo({ top: document.getElementById("order")!.offsetTop - 12, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) return <Success result={result} />;

  return (
    <form className="order-form" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend>
          {PACKAGES.length > 1 ? "1. Юу авах вэ?" : "1. Таны багц"}
        </legend>
        <div className="pkg-list">
          {PACKAGES.map((p) => (
            <label key={p.id} className={`pkg ${pkg === p.id ? "is-active" : ""}`}>
              <input
                type="radio"
                name="pkg"
                value={p.id}
                checked={pkg === p.id}
                onChange={() => setPkg(p.id)}
              />
              <span className="pkg-body">
                {p.badge && <span className="pkg-badge">{p.badge}</span>}
                <span className="pkg-title">{p.title}</span>
                <span className="pkg-sub">{p.subtitle}</span>
              </span>
              <span className="pkg-price">{formatMNT(p.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>2. Хүргэлтийн мэдээлэл</legend>
        <div className="seg">
          <button
            type="button"
            className={location === "ub" ? "is-active" : ""}
            onClick={() => {
              setLocation("ub");
              setArea("");
            }}
          >
            Улаанбаатар
          </button>
          <button
            type="button"
            className={location === "countryside" ? "is-active" : ""}
            onClick={() => {
              setLocation("countryside");
              setArea("");
            }}
          >
            Орон нутаг
          </button>
        </div>

        <label className="field">
          <span>Нэр</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Таны нэр" />
        </label>
        <label className="field">
          <span>Утасны дугаар</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9911 2233"
            maxLength={9}
          />
        </label>
        <label className="field">
          <span>{location === "ub" ? "Дүүрэг" : "Аймаг"}</span>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">— Сонгох —</option>
            {(location === "ub" ? UB_DISTRICTS : AIMAGS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{location === "ub" ? "Дэлгэрэнгүй хаяг" : "Сум, унааны мэдээлэл"}</span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder={
              location === "ub"
                ? "Хороо, байр, орц, давхар, тоот"
                : "Сум/хот, ямар унаанд тавих, хүлээн авах хүний утас"
            }
          />
        </label>
        <label className="field">
          <span>
            Нэмэлт тэмдэглэл <em>(заавал биш)</em>
          </span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Жишээ: оройн 6-аас хойш" />
        </label>
        <input
          className="hp"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          aria-hidden="true"
          name="website"
        />
      </fieldset>

      <fieldset>
        <legend>3. Төлбөр</legend>
        {location === "ub" ? (
          <div className="pay-list">
            <label className={`pay ${payment === "cod" ? "is-active" : ""}`}>
              <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              <span>
                <strong>Хүргэлтээр төлөх</strong>
                <small>Бараагаа хүлээн аваад бэлнээр эсвэл дансаар төлнө</small>
              </span>
            </label>
            <label className={`pay ${payment === "prepay" ? "is-active" : ""}`}>
              <input type="radio" checked={payment === "prepay"} onChange={() => setPayment("prepay")} />
              <span>
                <strong>Урьдчилж төлөх · −{formatMNT(PREPAY_DISCOUNT)}</strong>
                <small>Дансаар шилжүүлээд {formatMNT(PREPAY_DISCOUNT)} хямдрал авна</small>
              </span>
            </label>
          </div>
        ) : (
          <p className="pay-note">
            Орон нутгийн захиалгыг <strong>урьдчилж төлнө</strong> — {formatMNT(PREPAY_DISCOUNT)} хямдралтай.
          </p>
        )}
      </fieldset>

      <div className="total">
        <span>Нийт төлөх</span>
        <strong>{formatMNT(total)}</strong>
      </div>
      <p className="total-sub">Хүргэлт үнэгүй</p>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? "Илгээж байна…" : "Захиалга өгөх"}
      </button>
      <p className="fine">Захиалга өгснөөр бид тантай утсаар холбогдож баталгаажуулна.</p>
    </form>
  );
}

function Success({ result }: { result: Result }) {
  const [copied, setCopied] = useState("");
  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  return (
    <div className="success">
      <div className="success-icon" aria-hidden="true">✓</div>
      <h3>Захиалга хүлээн авлаа!</h3>
      <p>
        Захиалгын дугаар: <strong>{result.orderId}</strong>
        <br />
        {result.packageTitle} · <strong>{formatMNT(result.amount)}</strong>
      </p>

      {result.payment === "prepay" ? (
        <>
          <p className="success-lead">Доорх данс руу шилжүүлнэ үү:</p>
          <dl className="bank">
            <div>
              <dt>Банк</dt>
              <dd>{BANK.bankName}</dd>
            </div>
            <div>
              <dt>Данс</dt>
              <dd>
                {BANK.accountNumber}
                <button type="button" onClick={() => copy(BANK.accountNumber, "acc")}>
                  {copied === "acc" ? "Хуулсан" : "Хуулах"}
                </button>
              </dd>
            </div>
            <div>
              <dt>Хүлээн авагч</dt>
              <dd>{BANK.accountHolder}</dd>
            </div>
            <div>
              <dt>Дүн</dt>
              <dd>{formatMNT(result.amount)}</dd>
            </div>
            <div>
              <dt>Гүйлгээний утга</dt>
              <dd>
                {result.orderId}
                <button type="button" onClick={() => copy(result.orderId, "ref")}>
                  {copied === "ref" ? "Хуулсан" : "Хуулах"}
                </button>
              </dd>
            </div>
          </dl>
          <p>Шилжүүлсний дараа гүйлгээний зургаа Messenger-ээр илгээгээрэй.</p>
          <a className="btn btn-primary btn-block" href={SITE.messengerUrl} target="_blank" rel="noopener noreferrer">
            Messenger-ээр илгээх
          </a>
        </>
      ) : (
        <p>Бид тантай удахгүй утсаар холбогдож хүргэлтийн цагийг тохирно. Бараагаа хүлээн аваад төлнө.</p>
      )}
    </div>
  );
}
