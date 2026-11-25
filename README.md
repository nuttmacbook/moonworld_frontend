# Moon World — Landing page ($MWLD)

หน้าแรกของ moonworld.app สำหรับเหรียญ **MWLD** บน BNB Chain ธีมเกมอวกาศ 3 มิติ:
ดาวเคราะห์หมุน, ฉากเอียงตามเมาส์, กราฟแบบกระจก, ตัวเลขวิ่ง, ส่วนผลตรวจความปลอดภัยของเหรียญ, ลิงก์ซื้อ/กราฟ/BscScan, อีเมลติดต่อ
หน้าเคลมของคนที่ซื้อพรีเซลอยู่อีกเว็บ (`VITE_CLAIM_URL` = presale.moonworld.app)

Vite + JavaScript ธรรมดา + Tailwind v4 + kitbox ตามโครง web3-prod-kit v2

- เว็บ **อ่านอย่างเดียว** ไม่ส่ง transaction: อ่าน `name`, `symbol`, `decimals`, `totalSupply` ของเหรียญจากเชน (1 รอบ, 4 eth_call, cache 60 วินาที)
- ยังไม่มี contract ของตัวเอง: `dev/settings/deploy.config.mjs` ว่าง (โครงพร้อมเพิ่ม contract ภายหลัง)
- ภาษา EN (ค่าเริ่มต้น) / ไทย มีเมนูรูปลูกโลกที่แถบบน
- มีหน้าปิดปรับปรุง เปิด/ปิดด้วย `VITE_MAINTENANCE`

---

## 1. โฟลเดอร์

| โฟลเดอร์ | คืออะไร | ใครแก้ |
| --- | --- | --- |
| ⚙️ `settings/` | ค่าตั้งของเว็บ (`.env`) | **คุณ — แก้ค่า** |
| ✏️ `src/project/` | โค้ดของเว็บนี้ | **คุณ — เขียนโค้ด** |
| 🔧 `src/engine/`, `dev/engine/` | ระบบ เหมือนกันทุกโปรเจกต์ | ไม่ต้องแก้ |
| 🤖 `src/generated/`, `dev/generated/` | ไฟล์ที่สคริปต์สร้าง | ห้ามแก้ด้วยมือ |

```
moonworld-landing/
├── settings/.env(.example)        ⚙️  ทุกค่าของเว็บ: ชื่อ, โดเมน, แอดเดรสเหรียญ, ลิงก์, tokenomics, ข้อมูล LP, หน้าปิดปรับปรุง
├── index.html                     ✏️  <head> ใช้ค่าจาก settings (%VITE_APP_*%, %VITE_SITE_URL%)
├── public/                        ✏️  brand.webp (โลโก้มีปีก), mascot.webp, coin.webp, favicon, og-image.png
├── src/
│   ├── project/
│   │   ├── settings.js            ✏️  อ่านค่าของโปรเจกต์ + ตรวจว่าครบ
│   │   ├── chain/                 ✏️  on-chain: reads.js (อ่านเหรียญ), viewParse.js, index.js
│   │   ├── ui/                    ✏️  off-chain: main.js, pages/home.js, componants/, main.css
│   │   └── lang/                  ✏️  index.js (t, setLang), th.js (คำแปลไทย)
│   ├── engine/                    🔧
│   └── generated/                 🤖  addresses.json (ยังว่าง)
└── dev/                           ── เครื่องมือ (ไม่ขึ้น production)
    ├── settings/                  ⚙️  deploy.config.mjs (ว่าง), test-tokens.json (MWLD ทดสอบ), local.env, ...
    ├── project/                   ✏️  seed.mjs, devActions.js, test/Token.test.mjs, scripts/check-lang.mjs
    ├── engine/                    🔧
    └── generated/                 🤖
```

## 2. ค่าตั้งใน `settings/.env`

| ค่า | ใช้ทำอะไร |
| --- | --- |
| `VITE_PROJECT_ID`, `VITE_CHAIN` | kitbox / network (`bsc`) — project id ในไฟล์เป็นของทดสอบ เปลี่ยนเป็นของลูกค้าก่อนเปิดจริง |
| `VITE_APP_NAME`, `VITE_APP_TAGLINE`, `VITE_APP_DESCRIPTION`, `VITE_SITE_URL` | ชื่อ, คำโปรย, คำอธิบาย, โดเมน (ใช้ใน `<head>` และภาพแชร์) |
| `VITE_MAINTENANCE` (`on`/`off`), `VITE_MAINTENANCE_MESSAGE`, `VITE_MAINTENANCE_BYPASS` | หน้าปิดปรับปรุง (ดูหัวข้อ 5) |
| `VITE_TOKEN_ADDRESS` | แอดเดรสเหรียญ MWLD — ชื่อ/symbol/decimals/supply อ่านจากเชน |
| `VITE_CLAIM_URL`, `VITE_SWAP_URL`, `VITE_CHART_URL`, `VITE_SECURITY_REPORT_URL` | ลิงก์หน้าเคลม, PancakeSwap, DexScreener, รายงาน GoPlus |
| `VITE_SUPPORT_EMAIL` | อีเมลติดต่อ (ส่วน Contact และ footer) |
| `VITE_TELEGRAM_URL`, `VITE_FACEBOOK_URL`, `VITE_YOUTUBE_URL` | ลิงก์โซเชียล — เว้นว่าง = ไม่แสดงไอคอนนั้น |
| `VITE_PRESALE_AMOUNT`, `VITE_TGE_UNLOCK_PERCENT`, `VITE_MONTHLY_UNLOCK_PERCENT`, `VITE_REWARD_POOL_PERCENT` | ตัวเลข tokenomics และกราฟ vesting (จำนวนเดือนคำนวณเอง) |
| `VITE_DEX_NAME`, `VITE_LP_LOCKER`, `VITE_LP_LOCKED_PERCENT`, `VITE_LP_BURNED_PERCENT`, `VITE_LP_LOCKED_UNTIL`, `VITE_SECURITY_SCAN_DATE` | ข้อมูลสภาพคล่องและวันที่สแกน (ค่าปัจจุบันมาจาก GoPlus พ.ย. 2026) |

ขาดค่าไหน หรือรูปแบบผิด (เช่นเปอร์เซ็นต์ไม่ใช่ตัวเลข วันที่ไม่ใช่ YYYY-MM-DD) หน้าเว็บจะขึ้น **"Setup is not finished"** พร้อมรายการ

> ข้อความ 8 ข้อในส่วน Token security (renounced, 0% tax, ฯลฯ) เป็นเนื้อหาใน `src/project/ui/pages/home.js` ตามผลสแกน GoPlus — ถ้าผลสแกนเปลี่ยน ต้องแก้ที่นั่นและอัปเดต `VITE_SECURITY_SCAN_DATE`

## 3. เปิดในเครื่อง

ต้องมี Node.js 22 ขึ้นไป

```bash
cp settings/.env.example settings/.env
npm install
npm run dev            # เว็บอ่านเหรียญจริงบน BSC
```

ทดสอบกับเชนในเครื่อง (ไม่ต้องใช้ BSC):

```bash
cd dev && npm install
npm run dev            # hardhat node + เหรียญ MWLD ทดสอบ + ข้อมูลตัวอย่าง + เปิดเว็บพร้อมแผงทดสอบ (ปุ่ม +MWLD เพิ่ม supply)
npm test               # เทสเหรียญทดสอบ (name/symbol/decimals/totalSupply)
node project/scripts/check-lang.mjs   # หาคำที่ยังไม่แปลไทย และ {placeholder} ไม่ตรงกัน
```

## 4. ขึ้น Vercel

1. Import repo → Framework: Vite (Build `npm run build`, Output `dist`)
2. Project → Settings → Environment Variables: ใส่ **ทุกบรรทัด** ใน `settings/.env` (ไฟล์ `.env` ไม่ขึ้น git)
3. Deploy แล้วผูกโดเมน `moonworld.app`

ค่า `VITE_` ถูกฝังตอน build: แก้ค่าบน Vercel แล้วต้องกด **Redeploy** (~1 นาที)

## 5. ปิดเว็บชั่วคราว (maintenance)

- ตั้ง `VITE_MAINTENANCE=on` บน Vercel แล้ว Redeploy → ทุกคนเห็นหน้า "We are updating Moon World" (ไม่ต่อกระเป๋า ไม่อ่าน RPC)
- `VITE_MAINTENANCE_MESSAGE` = ข้อความเสริม (ว่าง = ประโยคมาตรฐาน)
- `VITE_MAINTENANCE_BYPASS=คำลับ` แล้วเปิด `https://moonworld.app/?bypass=คำลับ` → เห็นเว็บจริงในแท็บนั้น (คำนี้อยู่ใน JS สาธารณะ กันได้แค่คนทั่วไป)
- เปิดกลับ: `VITE_MAINTENANCE=off` แล้ว Redeploy

## 6. ภาษา

- ข้อความอังกฤษเขียนในโค้ดผ่าน `t("...")` คำแปลอยู่ `src/project/lang/th.js` ไม่มีคำแปล → แสดงอังกฤษ
- เพิ่มภาษา: 1 แถวใน `LANGUAGES` (`src/project/lang/index.js`) + 1 ไฟล์คำแปล
- วันที่ทุกจุดแสดงเป็น UTC; ไทยใช้ปี ค.ศ.
- คำแปลไทยควรให้เจ้าของภาษาตรวจก่อนเปิดจริง

## 7. แก้หน้าตา

| อยากแก้ | ไฟล์ |
| --- | --- |
| เนื้อหาแต่ละส่วน | `src/project/ui/pages/home.js` |
| สี ฟอนต์ การ์ดกระจก กราฟ แอนิเมชัน | `src/project/ui/main.css` |
| ดาวเคราะห์ 7 แบบ (gas, pink, gold, ocean, ice, moon, lava) | `src/project/ui/componants/planet.js` |
| พื้นหลังอวกาศ, แสง, ดาวตก | `src/project/ui/componants/ambient.js` + `main.css` |
| เอียงตามเมาส์, ตัวเลขวิ่ง | `src/project/ui/componants/effects.js` (ค่า `--nx`, `--ny`, `--mx`, `--my`, `--p`) |
| ลาย low-poly / hex / กริด ในการ์ด | `src/project/ui/componants/decor.js` |
| ไอคอน | `src/project/ui/componants/icons.js` |

ผู้ใช้ที่ตั้งเครื่องให้ลดการเคลื่อนไหว (prefers-reduced-motion) จะเห็นหน้านิ่งและตัวเลขเต็มทันที

## 8. เพิ่ม contract ภายหลัง

ทำตามสกิล web3-prod-kit: `.sol` ใน `dev/project/contracts/` → `dev/settings/contracts/<ชื่อ>.env` → `...proxied({...})` ใน `deploy.config.mjs` → `exports.json` → เทส → อ่านใน `src/project/chain/reads.js`
