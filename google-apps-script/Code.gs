/**
 * Warm Nomad — захиалгыг Google Sheet-д хадгалах скрипт.
 *
 * 1. Google Sheet нээ → Extensions → Apps Script.
 * 2. Энэ кодыг бүхэлд нь хуулж тавь.
 * 3. Доорх SECRET-ийг өөрийн нууц үгээр соль (Vercel-ийн ORDER_SECRET-тэй ижил байна).
 * 4. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 *    → Deploy → гарч ирсэн URL-ийг Vercel-ийн GOOGLE_SCRIPT_URL-д тавина.
 *
 * ШИНЭЧЛЭХДЭЭ (URL өөрчлөгдөхгүй байлгах):
 *    Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
 *
 * ҮЛДЭГДЭЛ: "Үлдэгдэл" хуудас анхны захиалга эсвэл сайт уншихад автоматаар үүснэ.
 *    C баганын тоог гараар засна (бараа ирэхэд нэмэх, цуцалсан захиалгыг буцааж нэмэх).
 *    Захиалга орох бүрт скрипт өөрөө хасна. Хүрэхгүй бол захиалгыг хүлээж авахгүй.
 */

const SECRET = "ӨӨРИЙН_НУУЦ_ҮГ_ЭНД";
const SHEET_NAME = "Захиалга";
const STOCK_SHEET = "Үлдэгдэл";
// Зөвхөн "Үлдэгдэл" хуудас анх үүсэхэд ашиглагдана. Дараа нь Sheet дээрээ засна.
const INITIAL_STOCK = [
  ["mask", "Дулаан маск", 40],
  ["flosser", "Усан шүдний цэвэрлэгч", 0],
  ["uv", "UV сойз ариутгагч", 25],
];

const HEADERS = [
  "Огноо",
  "Захиалгын №",
  "Төлөв",
  "Багц",
  "Дүн (₮)",
  "Төлбөр",
  "Бүс",
  "Дүүрэг/Аймаг",
  "Хаяг",
  "Нэр",
  "Утас",
  "Тэмдэглэл",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    // Нууц үгээ солиогүй бол хэнээс ч хүлээж авахгүй
    if (!SECRET || SECRET === "ӨӨРИЙН_НУУЦ_ҮГ_ЭНД" || data.secret !== SECRET) {
      return json({ ok: false, error: "unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    // Үлдэгдэл шалгаад хасна (lock дотор тул давхар захиалга зөрчихгүй)
    const items = data.items && typeof data.items === "object" ? data.items : {};
    const stockSheet = getStockSheet(ss);
    const stockRows = stockSheet.getRange(2, 1, Math.max(stockSheet.getLastRow() - 1, 1), 3).getValues();
    const updates = [];
    for (const key in items) {
      const qty = Math.max(0, Math.floor(Number(items[key]) || 0));
      if (!qty) continue;
      const idx = stockRows.findIndex((r) => String(r[0]).trim() === key);
      if (idx === -1) continue; // жагсаалтад байхгүй бараа — хязгааргүй гэж үзнэ
      const have = Number(stockRows[idx][2]) || 0;
      if (have < qty) return json({ ok: false, error: "out_of_stock" });
      updates.push([idx + 2, have - qty]);
    }
    updates.forEach(([row, val]) => stockSheet.getRange(row, 3).setValue(val));

    const when = Utilities.formatDate(new Date(data.createdAt), "Asia/Ulaanbaatar", "yyyy-MM-dd HH:mm");
    sheet.appendRow([
      when,
      data.orderId,
      data.payment === "Урьдчилж" ? "Төлбөр хүлээгдэж байна" : "Шинэ",
      safe(data.package),
      Number(data.amount) || 0,
      safe(data.payment),
      safe(data.location),
      safe(data.area),
      safe(data.address),
      safe(data.name),
      "'" + String(data.phone).replace(/\D/g, ""), // тэгээр эхэлсэн тоо алдагдахгүй
      safe(data.note),
    ]);

    return json({ ok: true });
  } catch (err) {
    console.error(err); // Дэлгэрэнгүйг Executions лог-д үлдээж, гадагш гаргахгүй
    return json({ ok: false, error: "server error" });
  } finally {
    lock.releaseLock();
  }
}

// Сайт үлдэгдлийг уншина: GET ...?action=stock
function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== "stock") return json({ ok: false });
  const sheet = getStockSheet(SpreadsheetApp.getActiveSpreadsheet());
  const rows = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 3).getValues();
  const stock = {};
  rows.forEach((r) => {
    const key = String(r[0]).trim();
    if (key) stock[key] = Math.max(0, Number(r[2]) || 0);
  });
  return json({ ok: true, stock: stock });
}

function getStockSheet(ss) {
  let sheet = ss.getSheetByName(STOCK_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(STOCK_SHEET);
    sheet.getRange(1, 1, 1, 3).setValues([["Код (бүү өөрчил)", "Бараа", "Үлдэгдэл"]]).setFontWeight("bold");
    sheet.getRange(2, 1, INITIAL_STOCK.length, 3).setValues(INITIAL_STOCK);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Formula injection-аас хамгаална: "=IMPORTXML(...)" гэх мэт утгыг томъёо биш текст болгоно
function safe(v) {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
