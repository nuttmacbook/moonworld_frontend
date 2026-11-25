# src/project/ ✏️ — โค้ดของคุณ (เว็บ)

แยกเป็น 2 ฝั่ง ห้ามปนกัน:

| โฟลเดอร์/ไฟล์ | คืออะไร | import อะไรได้ |
| --- | --- | --- |
| `chain/` **on-chain** | อ่านเหรียญ MWLD: `reads.js` (1 รอบ/หน้า = name, symbol, decimals, totalSupply), `viewParse.js`, `index.js` (ประตูเดียวที่ UI ใช้); `intereacts/` ว่าง เพราะหน้านี้ไม่ส่ง tx | `engine/chain`, `generated/`, `settings.js` |
| `ui/` **off-chain** | หน้าตา: `main.js` (หน้า + ปุ่ม), `pages/home.js`, `componants/` (header, footer, toast, maintenance, ambient, effects, planet, decor, icons), `theme.js`, `main.css` | `../chain` (index.js เท่านั้น), `engine/ui`, `engine/settings`, `../settings.js`, `../lang` |
| `settings.js` | ค่าของโปรเจกต์นี้จาก `settings/.env` (ลิงก์, tokenomics, ข้อมูล LP) ขาดค่า → หน้า "Setup is not finished" | `engine/settings` |
| `lang/` | ภาษา: ข้อความอังกฤษเขียนในโค้ดผ่าน `t("...")`, คำแปลไทยใน `th.js` | — |

UI ไม่เคย import ABI, kitbox หรือ engine/chain ตรง ๆ
