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
 * ҮЛДЭГДЭЛ: "Үлдэгдэл" хуудас автоматаар үүснэ:
 *    Ирсэн      — бараа ирэх бүрт ЗӨВХӨН ЭНИЙГ гараар нэмнэ (жишээ нь flosser 0 → 25)
 *    Зарагдсан  — "Захиалга" хуудаснаас өөрөө тоологдоно (Цуцалсан захиалгыг тоолохгүй)
 *    Үлдэгдэл   — Ирсэн − Зарагдсан. Сайт энэ тоог харуулна. 0 бол захиалга авахгүй.
 *    Захиалга цуцлагдвал "Төлөв" баганаас "Цуцалсан" гэж сонгоход бараа буцаж нэмэгдэнэ.
 */

const SECRET = "ӨӨРИЙН_НУУЦ_ҮГ_ЭНД";
const SHEET_NAME = "Захиалга";
const STOCK_SHEET = "Үлдэгдэл";
const CANCELLED = "Цуцалсан";
const STATUSES = ["Шинэ", "Төлбөр хүлээгдэж байна", "Баталгаажсан", "Хүргэгдсэн", CANCELLED];
// Бараа бүр "Захиалга" хуудсанд өөрийн ширхэгийн баганатай (M, N, O)
const ITEMS = [
  { key: "mask", name: "Дулаан маск", header: "Маск (ш)", initial: 40 },
  { key: "flosser", name: "Усан шүдний цэвэрлэгч", header: "Flosser (ш)", initial: 0 },
  { key: "uv", name: "UV сойз ариутгагч", header: "UV (ш)", initial: 25 },
];
const STOCK_HEADERS = ["Код (бүү өөрчил)", "Бараа", "Ирсэн", "Зарагдсан", "Үлдэгдэл"];

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
    const sheet = getOrderSheet(ss);
    const stockSheet = getStockSheet(ss);

    // Үлдэгдэл шалгана (lock дотор тул зэрэг ирсэн захиалга давхар зарахгүй)
    const items = data.items && typeof data.items === "object" ? data.items : {};
    const stock = readStock(stockSheet);
    const qtys = ITEMS.map((it) => Math.max(0, Math.floor(Number(items[it.key]) || 0)));
    for (let i = 0; i < ITEMS.length; i++) {
      if (qtys[i] && (stock[ITEMS[i].key] || 0) < qtys[i]) return json({ ok: false, error: "out_of_stock" });
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
    ].concat(qtys.map((q) => q || "")));
    SpreadsheetApp.flush(); // дараагийн захиалга шинэ үлдэгдлийг харна

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
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return json({ ok: true, stock: readStock(getStockSheet(ss)) });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "server error" });
  }
}

/** "Үлдэгдэл" баганыг { mask: 40, ... } болгож уншина */
function readStock(sheet) {
  const rows = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 5).getValues();
  const stock = {};
  rows.forEach((r) => {
    const key = String(r[0]).trim();
    if (key) stock[key] = Math.max(0, Number(r[4]) || 0);
  });
  return stock;
}

function getOrderSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.setFrozenRows(1);
  }
  // Хуудсыг Table (Format → Convert to table) болгосон бол толгой, сонголтыг Table өөрөө удирдана.
  // Тэр үед эдгээрийг өөрчлөх гэвэл "typed columns" алдаа гарна → алгасаад захиалгаа хадгална.
  try {
    const all = HEADERS.concat(ITEMS.map((it) => it.header));
    const current = sheet.getRange(1, 1, 1, all.length).getValues()[0];
    if (current.join("|") !== all.join("|")) {
      sheet.getRange(1, 1, 1, all.length).setValues([all]).setFontWeight("bold");
    }
    // Төлөв баганад сонголт (Цуцалсан гэх мэт)
    const status = sheet.getRange(2, 3, sheet.getMaxRows() - 1, 1);
    if (!status.getDataValidation()) {
      status.setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(true).build()
      );
    }
  } catch (err) {
    console.warn("Захиалга хуудсын тохиргоог алгаслаа: " + err);
  }
  return sheet;
}

function getStockSheet(ss) {
  let sheet = ss.getSheetByName(STOCK_SHEET);
  if (!sheet) sheet = ss.insertSheet(STOCK_SHEET);
  if (sheet.getRange(1, 4).getValue() === STOCK_HEADERS[3]) return sheet; // аль хэдийн шинэ загвартай

  // Шинээр үүсгэх эсвэл хуучин (Код | Бараа | Үлдэгдэл) загварыг шилжүүлэх
  const old = {};
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues().forEach((r) => {
      if (String(r[0]).trim()) old[String(r[0]).trim()] = Number(r[2]) || 0;
    });
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, STOCK_HEADERS.length).setValues([STOCK_HEADERS]).setFontWeight("bold");
  ITEMS.forEach((it, i) => {
    const row = i + 2;
    const col = columnLetter(HEADERS.length + 1 + i); // M, N, O
    const o = "'" + SHEET_NAME + "'!";
    sheet.getRange(row, 1, 1, 3).setValues([[it.key, it.name, it.key in old ? old[it.key] : it.initial]]);
    sheet.getRange(row, 4).setFormula(`=SUMIFS(${o}${col}2:${col},${o}C2:C,"<>${CANCELLED}")`);
    sheet.getRange(row, 5).setFormula(`=C${row}-D${row}`);
  });
  sheet.setFrozenRows(1);
  sheet.getRange(1, 3, ITEMS.length + 1, 1).setBackground("#fff7d6"); // гараар засах багана
  SpreadsheetApp.flush();
  return sheet;
}

function columnLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Formula injection-аас хамгаална: "=IMPORTXML(...)" гэх мэт утгыг томъёо биш текст болгоно
function safe(v) {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
