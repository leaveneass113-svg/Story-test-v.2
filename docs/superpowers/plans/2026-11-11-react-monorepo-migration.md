# แผนการย้ายระบบ Frontend สู่ React + Vite + TypeScript + Tailwind CSS + shadcn/ui (Monorepo)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ย้ายหน้าต่างการทำงานของแอปแชทนิยายจาก Vanilla HTML/CSS/JS (`frontend/index.html`, `frontend/js/app.js`, `frontend/js/editor.js`, `frontend/js/notes.js`, `frontend/js/storage.js`) มาเป็น React Components เต็มรูปแบบภายใต้โครงสร้าง Monorepo (`apps/web`, `apps/server`, `packages/shared`) โดยใช้ `shadcn/ui Trace` และ `Reasoning` สำหรับแสดงกระบวนการคิดของ AI

**Architecture:** แยกส่วนระบบออกเป็น 3 แพ็กเกจหลักใน npm workspaces ได้แก่ `packages/shared` (Pure Logic & TypeScript Definitions), `apps/server` (Express API, SSE Streaming & Supabase Sync) และ `apps/web` (React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + React Aria Components) โดยจัดการสถานะนิยายด้วย Custom Hooks ที่เชื่อมต่อกับ IndexedDB/LocalStorage และสตรีมข้อความจาก `/api/chat/stream`

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4, shadcn/ui (`react-aria-components`, `lucide-react`, `streamdown`), Express.js, Supabase

---

## โครงสร้างไฟล์เป้าหมายใน `apps/web`

```text
apps/web/
├── components/
│   ├── ui/
│   │   ├── collapsible.tsx         # (สร้างแล้ว) React Aria Disclosure Collapsible
│   │   └── trace.tsx               # (สร้างแล้ว) shadcn/ui Trace Component
│   ├── ai-elements/
│   │   └── reasoning.tsx           # (สร้างแล้ว) Reasoning Component บนฐาน Trace + Streamdown
│   ├── layout/
│   │   └── top-navbar.tsx          # แถบเมนูด้านบน (สลับ Sidebar, ชื่อเรื่อง, ปุ่มส่งออก, ตั้งค่า)
│   ├── lorebook/
│   │   ├── lorebook-sidebar.tsx    # แถบซ้าย: ภาพรวมโครงเรื่อง, ตัวละคร, สถานที่, ไทม์ไลน์
│   │   ├── lore-card.tsx           # การ์ดแสดงรายการย่อยใน Lorebook พร้อมปุ่มลบ
│   │   └── lore-modal.tsx          # หน้าต่างเพิ่ม/แก้ไขข้อมูลตัวละคร สถานที่ ไทม์ไลน์ และภาพรวม
│   ├── editor/
│   │   ├── editor-toolbar.tsx      # แถบเครื่องมือจัดรูปแบบ (H1, H2, Bold, Italic, Lists, Clear)
│   │   ├── novel-canvas.tsx        # กระดาษแต่งนิยาย Rich Text พร้อมจำตำแหน่ง Cursor & Auto-scroll
│   │   └── floating-ai-bar.tsx     # แถบคำสั่งลัดเมื่อลากคลุมข้อความ (ขยายความ, เกลาสำนวน, เปลี่ยนอารมณ์)
│   ├── chat/
│   │   ├── chat-sidebar.tsx        # แถบขวา: แชทผู้ช่วย AI, เลือกโทนภาษา, กล่องพิมพ์คำสั่ง
│   │   └── chat-message-item.tsx   # ข้อความแชทแต่ละรายการ ใช้ <Reasoning> แสดงกระบวนการคิด
│   └── modals/
│       ├── stories-modal.tsx       # จัดการรายการนิยายหลายเรื่อง (เพิ่ม/สลับ/ลบเรื่อง)
│       ├── export-modal.tsx        # ส่งออกนิยาย (.txt, .md, .html, .doc)
│       ├── settings-modal.tsx      # ตั้งค่า Gemini / OpenRouter API Key
│       └── confirm-dialog.tsx      # กล่องยืนยันการลบข้อมูล
├── hooks/
│   ├── use-stories.ts              # จัดการ State นิยายหลายเรื่อง + ซิงก์ IndexedDB & LocalStorage
│   └── use-chat-stream.ts          # จัดการเชื่อมต่อ SSE Stream (/api/chat/stream) + AbortController
├── lib/
│   ├── utils.ts                    # (สร้างแล้ว) ฟังก์ชัน cn()
│   ├── storage.ts                  # พอร์ตจาก frontend/js/storage.js (IndexedDB + Cloud Sync)
│   └── export-utils.ts             # พอร์ตจาก frontend/js/editor.js (getSafeFilename, triggerDownload)
└── src/
    ├── App.tsx                     # หน้าจอหลักรวม 3 คอลัมน์ (Lorebook, Novel Canvas, AI Chat)
    ├── main.tsx                    # จุดเริ่มต้น React
    └── index.css                   # Tailwind CSS v4 + ตัวแปรธีม Dark Mode & Shimmer Utility
```

---

## ตารางเทียบเคียงการย้ายโค้ดเดิม (Migration Mapping)

| ไฟล์เดิม (Vanilla JS) | หน้าที่เดิม | ไฟล์ใหม่ใน `apps/web` (React + TS) |
| :--- | :--- | :--- |
| `frontend/js/storage.js` | `NovelStorage` (IndexedDB, LocalStorage, Supabase History Sync) | `apps/web/lib/storage.ts` และ `apps/web/hooks/use-stories.ts` |
| `frontend/js/editor.js` | `executeFormatting`, `getSafeFilename`, `triggerDownload` | `apps/web/lib/export-utils.ts` และ `apps/web/components/editor/*` |
| `frontend/js/notes.js` | `renderLoreCards` (เรนเดอร์การ์ดตัวละคร/สถานที่/ไทม์ไลน์) | `apps/web/components/lorebook/lorebook-sidebar.tsx`, `lore-card.tsx` |
| `frontend/js/app.js` (บรรทัด 1089-1263) | `renderThoughtLineHtml`, `formatReasoningContent` | `apps/web/components/ai-elements/reasoning.tsx` + `components/ui/trace.tsx` |
| `frontend/js/app.js` (ส่วน SSE Stream) | `sendPromptToAi`, `AbortController`, แยก `<story_canvas>` | `apps/web/hooks/use-chat-stream.ts` และ `chat-sidebar.tsx` |
| `frontend/index.html` | โครงสร้าง Layout 3 แผง และ Modal ทั้งหมด | `apps/web/src/App.tsx`, `components/layout/*`, `components/modals/*` |

---

## ขั้นตอนการดำเนินงาน (Implementation Tasks)

### Task 1: ระบบจัดเก็บข้อมูลและจัดการสถานะนิยาย (`lib/storage.ts` & `hooks/use-stories.ts`)

**Files:**
- Create: `apps/web/lib/storage.ts`
- Create: `apps/web/hooks/use-stories.ts`

- [ ] **Step 1: พอร์ต `NovelStorage` จาก `frontend/js/storage.js` มาเป็น TypeScript ใน `apps/web/lib/storage.ts`**
  - รองรับ `initIndexedDb()`, `loadAllStories()`, `saveAllStories(stories)`, `fetchCloudChatHistory(storyId)`, `syncChatToCloud(payload)` พร้อมชนิดข้อมูล `Story` จาก `@novel-chat/shared`
- [ ] **Step 2: สร้าง Custom Hook `useStories()` ใน `apps/web/hooks/use-stories.ts`**
  - ใช้ฟังก์ชันจาก `@novel-chat/shared` (`createDefaultStory`, `addNewStory`, `switchStory`, `deleteStory`, `addNoteItem`, `deleteNoteItem`, `clearCanvasContent`)
  - รองรับการโหลดข้อมูลเริ่มต้นจาก IndexedDB และ Migration จาก LocalStorage เดิม (`novel_stories`)
- [ ] **Step 3: ตรวจสอบ Type Check**
  - รันคำสั่ง: `npm --workspace=apps/web run typecheck`

### Task 2: แถบเมนูด้านบนและระบบจัดการข้อมูล Lorebook ด้านซ้าย (`top-navbar.tsx` & `lorebook/*`)

**Files:**
- Create: `apps/web/components/layout/top-navbar.tsx`
- Create: `apps/web/components/lorebook/lore-card.tsx`
- Create: `apps/web/components/lorebook/lorebook-sidebar.tsx`
- Create: `apps/web/components/lorebook/lore-modal.tsx`

- [ ] **Step 1: สร้าง `TopNavbar` คอมโพเนนต์**
  - มีปุ่มสลับแถบซ้าย (`btn-toggle-left`), ช่องแก้ไขชื่อเรื่อง (`doc-title-input`), ปุ่มเปิดรายการนิยาย (`btn-stories-list`), ปุ่มส่งออก (`btn-export`), ปุ่มตั้งค่า API Key (`btn-settings`) และปุ่มสลับแถบแชทขวา (`btn-toggle-right`)
- [ ] **Step 2: สร้าง `LorebookSidebar`, `LoreCard` และ `LoreModal`**
  - แสดงหมวดหมู่ทั้ง 4 หมวดแบบพับเก็บได้ (`Collapsible`): ภาพรวมโครงเรื่อง (`overview`), ตัวละคร (`characters`), สถานที่ (`locations`) และไทม์ไลน์ (`timelines`)
- [ ] **Step 3: ตรวจสอบ Type Check**
  - รันคำสั่ง: `npm --workspace=apps/web run typecheck`

### Task 3: กระดาษแต่งนิยายตรงกลางและเครื่องมือจัดรูปแบบ (`editor/*` & `lib/export-utils.ts`)

**Files:**
- Create: `apps/web/lib/export-utils.ts`
- Create: `apps/web/components/editor/editor-toolbar.tsx`
- Create: `apps/web/components/editor/novel-canvas.tsx`
- Create: `apps/web/components/editor/floating-ai-bar.tsx`

- [ ] **Step 1: พอร์ตฟังก์ชันส่งออกไฟล์และจัดรูปแบบมาที่ `apps/web/lib/export-utils.ts`**
- [ ] **Step 2: สร้าง `EditorToolbar`, `NovelCanvas` และ `FloatingAiBar`**
  - เก็บตำแหน่งเคอร์เซอร์ (`savedEditorRange`) เพื่อรองรับการแทรกเนื้อหาจาก AI ลงในจุดที่เลือก และแสดง Floating AI Bar เมื่อผู้ใช้ลากคลุมข้อความในกระดาษ
- [ ] **Step 3: ตรวจสอบ Type Check**
  - รันคำสั่ง: `npm --workspace=apps/web run typecheck`

### Task 4: แผงแชทผู้ช่วย AI ด้านขวาและการสตรีมพร้อม `<Reasoning>` (`hooks/use-chat-stream.ts` & `chat/*`)

**Files:**
- Create: `apps/web/hooks/use-chat-stream.ts`
- Create: `apps/web/components/chat/chat-message-item.tsx`
- Create: `apps/web/components/chat/chat-sidebar.tsx`

- [ ] **Step 1: สร้าง Hook `useChatStream` เชื่อมต่อ SSE (`POST /api/chat/stream`)**
  - แยกอีเวนต์ `thinking`, `story`, `done`, `error` คำนวณเวลาการคิดเป็นวินาที (`duration`) และสตรีมเนื้อหาเข้ากระดาษอัตโนมัติเมื่อเป็นคำสั่งแต่ง/แก้ไขนิยาย (`StoryChatCore.splitChatAndCanvasContent`)
- [ ] **Step 2: สร้าง `ChatMessageItem` โดยใช้ `<Reasoning>`, `<ReasoningTrigger>`, `<ReasoningContent>` จาก `@/components/ai-elements/reasoning`**
  - แสดงสถานะ `"Thinking"` ขณะที่ `isStreaming={true}` และแสดง `"Thought for Xs"` เมื่อคิดเสร็จ พร้อมรองรับปุ่มแทรกลงในนิยาย สร้างคำตอบใหม่ คัดลอก และลบข้อความ
- [ ] **Step 3: สร้าง `ChatSidebar` พร้อมตัวเลือกโทนภาษา (`บรรยายเน้นอารมณ์`, `บทสนทนาลื่นไหล`, `แอ็กชันตื่นเต้น`, `โรแมนติกอบอุ่น`, `ลึกลับชวนติดตาม`) และปุ่มหยุดสตรีม (`AbortController`)**
- [ ] **Step 4: ตรวจสอบ Type Check**
  - รันคำสั่ง: `npm --workspace=apps/web run typecheck`

### Task 5: หน้าต่าง Modal ทั้งหมดและการประกอบร่างใน `App.tsx`

**Files:**
- Create: `apps/web/components/modals/stories-modal.tsx`
- Create: `apps/web/components/modals/export-modal.tsx`
- Create: `apps/web/components/modals/settings-modal.tsx`
- Create: `apps/web/components/modals/confirm-dialog.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/server/src/server.js`

- [ ] **Step 1: สร้างคอมโพเนนต์ Modal สำหรับจัดการเรื่อง ส่งออกไฟล์ ตั้งค่า API Key และกล่องยืนยัน**
- [ ] **Step 2: ประกอบ Layout 3 คอลัมน์เข้าด้วยกันใน `apps/web/src/App.tsx` พร้อมรองรับ Responsive Drawer บนหน้าจอมือถือ/แท็บเล็ต**
- [ ] **Step 3: อัปเดต `apps/server/src/server.js` ให้เสิร์ฟไฟล์ Build จาก `apps/web/dist` เป็นหลัก (และ Fallback ไปยัง `frontend` หากยังไม่ได้ Build)**
- [ ] **Step 4: รัน `npm run typecheck`, `npm run build` และ `npm test` เพื่อยืนยันว่าระบบทั้งหมดทำงานร่วมกันได้สมบูรณ์**
