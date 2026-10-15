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

const SECRET = "wn-55f6cc3ae6f5";
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
    if (data.secret !== SECRET) {
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
      data.package,
      data.amount,
      data.payment,
      data.location,
      data.area,
      data.address,
      data.name,
      "'" + data.phone, // тэгээр эхэлсэн тоо алдагдахгүй
      data.note,
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
