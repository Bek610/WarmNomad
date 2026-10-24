// ============================================================
//  БАРААНЫ ҮЛДЭГДЭЛ
//  Тоог Google Sheet-ийн "Үлдэгдэл" хуудаснаас уншина (кодоор биш).
//  Захиалга орох бүрт скрипт өөрөө хасна. Бараа ирэхэд Sheet дээр тоог нь засна.
// ============================================================

export const STOCK_KEYS = ["mask", "flosser", "uv"] as const;
export type StockKey = (typeof STOCK_KEYS)[number];
export type Stock = Record<StockKey, number>;

/**
 * Багцад харуулах үлдэгдэл = орцуудын хамгийн бага ширхэг (жишээ нь маск 40 ширхэг).
 * Аль нэг орц хүрэхгүй бол 0 (дууссан). null = мэдэгдэхгүй.
 */
export function packageLeft(uses: Partial<Record<StockKey, number>>, stock: Stock | null): number | null {
  if (!stock) return null;
  const parts = Object.entries(uses) as [StockKey, number][];
  if (!parts.length) return null;
  if (parts.some(([k, q]) => (stock[k] ?? 0) < (q || 1))) return 0;
  return Math.min(...parts.map(([k]) => stock[k] ?? 0));
}

/**
 * Sheet-ээс үлдэгдэл уншина (60 секунд кэшлэнэ).
 * Скрипт шинэчлэгдээгүй эсвэл алдаа гарвал null буцаана → сайт үлдэгдэл харуулахгүй, захиалга хэвийн авна.
 */
export async function getStock(): Promise<Stock | null> {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) return null;
  try {
    const res = await fetch(`${url}?action=stock`, { next: { revalidate: 60 }, redirect: "follow" });
    if (!res.ok) return null;
    const data = JSON.parse(await res.text());
    if (data?.ok !== true || typeof data.stock !== "object") return null;
    const out = {} as Stock;
    for (const k of STOCK_KEYS) {
      const n = Number(data.stock[k]);
      if (!Number.isFinite(n)) return null;
      out[k] = Math.max(0, Math.floor(n));
    }
    return out;
  } catch {
    return null;
  }
}
