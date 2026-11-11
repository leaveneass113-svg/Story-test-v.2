# 📖 Smart Novel AI Chat & Co-Writer (Monorepo)

แอปพลิเคชันผู้ช่วยเขียนนิยายอัจฉริยะ (Smart Novel AI Chat & Co-Writer) สถาปัตยกรรม Monorepo (React + Vite + TypeScript + Tailwind CSS + shadcn/ui `Trace` & `Reasoning` และ Express + Supabase) พร้อมระบบสตรีมมิ่งกระบวนการคิดของ AI (`<thinking>...</thinking>`) แบบเรียลไทม์

---

## 🌟 ฟีเจอร์เด่น (Key Features)

1. **Dual-Channel Real-time Streaming (SSE):** คัดแยกขั้นตอนความคิด (Thinking Process) แสดงผลผ่านคอมโพเนนต์ `Reasoning` (`shadcn/ui Trace`) และส่งเนื้อหานิยายลงกล่องแชทหลักพร้อมกันแบบเรียลไทม์
2. **Supabase Database Integration:** จัดเก็บประวัติการคุยและการสร้างสรรค์นิยาย (`chat_history`) อย่างเป็นระบบ
3. **Local Fallback Protection:** หากยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase ระบบจะสลับไปใช้ In-Memory / Local Fallback อัตโนมัติ โดยไม่ทำให้การทำงานสะดุด
4. **Multi-Model Support:** รองรับทั้ง Google Gemini (เช่น `gemini-3.8-flash`) และ OpenRouter
5. **ความปลอดภัยระดับสูง (Zero Secret Exposure & BYOK):**
   - **Server Proxy Mode:** คีย์ลับหลักของระบบ (เช่น Supabase Service Role Key และ Server API Key) จะถูกเก็บไว้ที่ฝั่ง Backend (`apps/server/.env`) เท่านั้น ไม่ถูกเปิดเผยสู่หน้าเว็บสาธารณะ
   - **Bring Your Own Key (BYOK):** หากผู้ใช้ระบุ Gemini API Key ส่วนตัวผ่านเมนูตั้งค่า คีย์จะถูกเก็บไว้เฉพาะใน Local Storage ของเบราว์เซอร์

---

## 🏗️ โครงสร้าง Monorepo (Project Structure)

```text
novel-chat-monorepo/
├── apps/
│   ├── web/                # Frontend (React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui)
│   │   ├── components/
│   │   │   ├── ui/         # collapsible.tsx, trace.tsx
│   │   │   └── ai-elements/# reasoning.tsx (Trace + Streamdown)
│   │   ├── lib/            # utils.ts
│   │   ├── src/            # App.tsx, main.tsx, index.css
│   │   └── test/           # reasoning-trace.test.mjs
│   └── server/             # Backend (Node.js + Express + SSE Stream + Supabase)
│       ├── src/            # server.js, config.js, ai/, db/, routes/
│       └── test/           # stream-parser.test.js, supabase-db.test.js, server-e2e.test.js
├── packages/
│   └── shared/             # @novel-chat/shared (story-chat-core.js + story-chat-core.d.ts)
├── tests/                  # test-core.js (Unit Tests สำหรับ Shared Core Logic)
└── package.json            # Root npm workspaces
```

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Quick Start)

### 1. ติดตั้ง Dependencies ทั้ง Monorepo

```bash
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ตัวอย่าง `.env.example` ไปเป็น `apps/server/.env`:

```bash
cp .env.example apps/server/.env
```

### 3. คำสั่งหลักสำหรับพัฒนาและทดสอบ

```bash
# รัน Frontend Dev Server (Vite: http://localhost:5173)
npm run dev:web

# รัน Backend API Server (Express: http://localhost:3001)
npm run dev:server

# ตรวจสอบ TypeScript Type Check ทั้งโปรเจกต์ (Shared, Backend, Frontend)
npm run typecheck

# รันชุดทดสอบทั้งหมด (Unit, Integration, Component และ E2E Tests)
npm test

# บิลด์ Frontend สำหรับใช้งานจริง (Production Build)
npm run build
```

---

## 📄 ลิขสิทธิ์ (License)

MIT License
