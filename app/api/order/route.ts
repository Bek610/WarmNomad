import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { AIMAGS, PREPAY_DISCOUNT, UB_DISTRICTS } from "@/lib/config";
import { getProduct } from "@/lib/products";

// Vercel дээр тохируулах орчны хувьсагчид:
//   GOOGLE_SCRIPT_URL  — Google Apps Script web app-ийн URL
//   ORDER_SECRET       — Apps Script-д тавьсан нууц үгтэй ижил
const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";
const SECRET = process.env.ORDER_SECRET || "";

function orderId() {
  const d = new Date(Date.now() + 8 * 3600 * 1000); // Улаанбаатарын цаг
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  // Андуурагддаг тэмдэгт (0/O, 1/I/L) оруулахгүй
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let rand = "";
  for (let i = 0; i < 4; i++) rand += chars[randomInt(chars.length)];
  return `WN${ymd}-${rand}`;
}

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
// Sheet дээр томъёо болж ажиллахаас сэргийлж эхний =,+,-,@ тэмдэгтийг хасна
const text = (v: unknown, n: number) => clip(v, n).replace(/^[=+\-@\t\r\s]+/, "");

export async function POST(req: Request) {
  // Зөвхөн JSON хүлээн авна — өөр сайтаас энгийн <form>-оор илгээхийг хаана
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 415 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  // Bot шалгалт: нуусан талбар бөглөгдсөн бол амжилттай мэт хариулаад хадгалахгүй
  if (clip(body.website, 100)) {
    return NextResponse.json({ orderId: orderId(), amount: 0, payment: "cod", packageTitle: "" });
  }

  const product = getProduct(clip(body.productSlug, 40) || "flosser");
  const pkg = product?.packages.find((p) => p.id === body.packageId && p.available);
  const location = body.location === "countryside" ? "countryside" : body.location === "ub" ? "ub" : null;
  const payment = location === "countryside" ? "prepay" : body.payment === "prepay" ? "prepay" : "cod";
  const name = text(body.name, 80);
  const phone = clip(body.phone, 20).replace(/\D/g, "");
  const area = clip(body.area, 40);
  const address = text(body.address, 400);
  const note = text(body.note, 300);

  if (!pkg) return NextResponse.json({ error: "Багцаа сонгоно уу." }, { status: 400 });
  if (!location) return NextResponse.json({ error: "Хүргэлтийн бүсээ сонгоно уу." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Нэрээ бичнэ үү." }, { status: 400 });
  if (!/^[5-9]\d{7}$/.test(phone))
    return NextResponse.json({ error: "Утасны дугаар 8 оронтой байх ёстой." }, { status: 400 });
  const areas: readonly string[] = location === "ub" ? UB_DISTRICTS : AIMAGS;
  if (!areas.includes(area)) return NextResponse.json({ error: "Дүүрэг/аймгаа сонгоно уу." }, { status: 400 });
  if (address.length < 5) return NextResponse.json({ error: "Хаягаа дэлгэрэнгүй бичнэ үү." }, { status: 400 });

  // Үнийг сервер талд тооцно — хэрэглэгчийн илгээсэн үнэд итгэхгүй
  const amount = pkg.price - (payment === "prepay" ? PREPAY_DISCOUNT : 0);
  const id = orderId();

  const row = {
    orderId: id,
    createdAt: new Date().toISOString(),
    package: pkg.title,
    amount,
    payment: payment === "prepay" ? "Урьдчилж" : "Хүргэлтээр",
    location: location === "ub" ? "УБ" : "Орон нутаг",
    area,
    address,
    name,
    phone,
    note,
  };

  if (!SCRIPT_URL || !SECRET) {
    // Нууц үг лог руу орохгүй; захиалгыг алдахгүйн тулд мэдээллийг л бичнэ
    console.error("GOOGLE_SCRIPT_URL эсвэл ORDER_SECRET тохируулаагүй байна. Захиалга:", row);
    return NextResponse.json(
      { error: "Сайтын тохиргоо дуусаагүй байна. Messenger-ээр захиална уу." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...row, secret: SECRET }),
      redirect: "follow",
    });
    const text = await res.text();
    let ok = res.ok;
    try {
      ok = ok && JSON.parse(text).ok === true;
    } catch {
      ok = false;
    }
    if (!ok) throw new Error(`Sheet error: ${res.status} ${text.slice(0, 200)}`);
  } catch (err) {
    console.error("Захиалга хадгалахад алдаа:", err, row);
    return NextResponse.json(
      { error: "Захиалга хадгалахад алдаа гарлаа. Дахин оролдох эсвэл Messenger-ээр бичнэ үү." },
      { status: 502 }
    );
  }

  return NextResponse.json({ orderId: id, amount, payment, packageTitle: pkg.title });
}
