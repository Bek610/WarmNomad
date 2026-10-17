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
 */

const SECRET = "ӨӨРИЙН_НУУЦ_ҮГ_ЭНД";
const SHEET_NAME = "Захиалга";

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

// Formula injection-аас хамгаална: "=IMPORTXML(...)" гэх мэт утгыг томъёо биш текст болгоно
function safe(v) {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
