# Warm Nomad: захиалгын сайт

Next.js сайт. Захиалга бүр Google Sheet-д хадгалагдана. Vercel дээр үнэгүй ажиллана.

## Засах цорын ганц файл: `lib/config.ts`

Үнэ, багц, дансны дугаар, түгээмэл асуулт, барааны үзүүлэлт, сэтгэгдэл бүгд энд байна.
**Эхлээд `BANK.accountNumber`-д дансны дугаараа заавал бич.**

---

## Тохируулах алхам (~20 минут)

### 1. Google Sheet + скрипт
1. Google Drive дээр шинэ **Google Sheet** үүсгэ. Нэрийг нь жишээ нь "Warm Nomad захиалга" гэж өг.
2. **Extensions → Apps Script** цэсийг нээ.
3. `google-apps-script/Code.gs` файлын кодыг бүхэлд нь хуулж тавь.
4. `SECRET = "..."` гэсэн мөрөнд өөрийн нууц үгийг бич. Жишээ нь `wn-2026-xk92`. Энэ нууц үгийг 2-р алхамд дахин ашиглана.
5. **Deploy → New deployment** → ⚙️ дүрс дээр дараад **Web app**-ийг сонго.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. **Deploy** дар → Google зөвшөөрөл асуухад зөвшөөр → гарч ирсэн **Web app URL**-ийг хуулж ав (`https://script.google.com/macros/s/.../exec`).

### 2. GitHub → Vercel
1. Энэ хавтсыг GitHub-д шинэ repo болгон оруул. `node_modules`, `.next` хавтсыг оруулахгүй, `.gitignore` үүнийг аль хэдийн хийсэн.
2. [vercel.com](https://vercel.com) дээр GitHub-аараа нэвтэр → **Add New → Project** → repo-гоо сонго.
3. **Environment Variables** хэсэгт дараахыг нэм:
   - `GOOGLE_SCRIPT_URL` = 1-р алхмын URL
   - `ORDER_SECRET` = Apps Script-д бичсэн нууц үг (яг ижил)
4. **Deploy** дар → сайт чинь `xxxx.vercel.app` хаягтай болно.

### 3. Шалгах
Сайт дээрээ туршилтын захиалга өгөөд Google Sheet-д мөр нэмэгдсэн эсэхийг хар. Туршилтын мөрийг дараа нь устгаарай.

---

## Зураг, видео нэмэх
1. Файлаа `public/` хавтсанд хий. Жишээ нь `public/product.jpg` эсвэл `public/product.mp4`.
2. `lib/config.ts` дотор `heroImage: "/product.jpg"` эсвэл `heroVideo: "/product.mp4"` гэж бич.
3. GitHub руу push хийхэд Vercel автоматаар шинэчилнэ.

## Бодит сэтгэгдэл нэмэх
`REVIEWS` хоосон байхад сэтгэгдлийн хэсэг сайт дээр харагдахгүй. Худалдан авагч зөвшөөрсний дараа нэм:
```ts
export const REVIEWS = [{ name: "Сарнай, БЗД", text: "Брекетийн завсар маш сайн цэвэрлэж байна." }];
```
Зохиомол сэтгэгдэл бичиж болохгүй. Facebook рекламын бодлогыг зөрчих бөгөөд худалдан авагчдын итгэлийг алдагдуулна.

## Ариутгагч дуусвал
`PACKAGES` дотор `bundle`-ийн `available: false` болго.

## Facebook Pixel (заавал биш)
Vercel-д `NEXT_PUBLIC_META_PIXEL_ID` нэмбэл хүн захиалга өгөх бүрт Facebook руу **Lead** гэсэн үйлдэл илгээнэ. Ингэвэл реклам "мессеж" биш, **захиалга** авахаар оновчлогдоно.

## Дараагийн шат: QPay
QPay merchant гэрээ гарсны дараа `app/api/` дотор нэхэмжлэх үүсгэх болон төлбөр шалгах route нэмнэ.

## Локал дээр ажиллуулах
```bash
npm install
cp .env.example .env.local   # утгуудаа бөглө
npm run dev                  # http://localhost:3000
```
