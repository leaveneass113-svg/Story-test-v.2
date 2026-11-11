/**
 * apps/web/test/reasoning-trace.test.mjs
 * Automated Unit & Component Integration Test Suite สำหรับ Trace และ Reasoning Components
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
const tempFiles = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`, err);
    failed++;
  }
}

async function bundleModule(entryFile, tag) {
  const outFile = path.join(__dirname, `.tmp-${tag}-${Date.now()}.mjs`);
  tempFiles.push(outFile);

  await build({
    entryPoints: [entryFile],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: outFile,
    jsx: "automatic",
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-aria-components",
      "lucide-react",
      "streamdown",
      "@radix-ui/react-use-controllable-state",
      "clsx",
      "tailwind-merge",
    ],
    alias: {
      "@": webRoot,
    },
  });

  return import(pathToFileURL(outFile).href);
}

function cleanupTempFiles() {
  for (const f of tempFiles) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  }
}

async function runTests() {
  console.log("========================================");
  console.log("🧪 รัน Unit & Component Tests: Frontend (Trace & Reasoning)");
  console.log("========================================\n");

  const tracePath = path.join(webRoot, "components/ui/trace.tsx");
  const reasoningPath = path.join(webRoot, "components/ai-elements/reasoning.tsx");

  const reasoningSource = fs.readFileSync(reasoningPath, "utf-8");

  const traceMod = await bundleModule(tracePath, "trace");
  const reasoningMod = await bundleModule(reasoningPath, "reasoning");

  await test("1. ตรวจสอบไฟล์ components/ui/trace.tsx และ Exports ครบถ้วน", async () => {
    const requiredExports = [
      "Trace",
      "TraceLine",
      "TraceIcon",
      "TraceTitle",
      "TraceDescription",
      "TraceCollapsible",
      "TraceCollapsibleTrigger",
      "TraceCollapsibleContent",
    ];
    for (const exp of requiredExports) {
      assert.ok(traceMod[exp], `ต้องมี export ${exp} ใน trace.tsx`);
    }
  });

  await test("2. ตรวจสอบไฟล์ components/ai-elements/reasoning.tsx คง Exports เดิมครบถ้วน", async () => {
    const requiredExports = [
      "Reasoning",
      "ReasoningTrigger",
      "ReasoningContent",
      "useReasoning",
    ];
    for (const exp of requiredExports) {
      assert.ok(reasoningMod[exp], `ต้องมี export ${exp} ใน reasoning.tsx`);
    }
    assert.ok(
      reasoningSource.includes("export type ReasoningProps"),
      "ต้องมี export type ReasoningProps"
    );
    assert.ok(
      reasoningSource.includes("export type ReasoningTriggerProps"),
      "ต้องมี export type ReasoningTriggerProps"
    );
    assert.ok(
      reasoningSource.includes("export type ReasoningContentProps"),
      "ต้องมี export type ReasoningContentProps"
    );
  });

  await test("3. ตรวจสอบการลบ Imports ที่ไม่ได้ใช้งานใน reasoning.tsx", async () => {
    assert.ok(
      !reasoningSource.includes("Shimmer"),
      "ต้องไม่มีการ import หรือใช้งาน Shimmer ใน reasoning.tsx"
    );
    assert.ok(
      !reasoningSource.includes("ChevronDownIcon"),
      "ต้องไม่มีการ import ChevronDownIcon ใน reasoning.tsx"
    );
    assert.ok(
      !reasoningSource.includes("@/components/ui/collapsible"),
      "ต้องเปลี่ยนจากการ import collapsible โดยตรงเป็น @/components/ui/trace"
    );
  });

  await test("4. ทดสอบการเรนเดอร์ Reasoning ขณะกำลังสตรีม (isStreaming=true -> status='running', 'Thinking')", async () => {
    const { Reasoning, ReasoningTrigger, ReasoningContent } = reasoningMod;

    const html = renderToStaticMarkup(
      React.createElement(
        Reasoning,
        { isStreaming: true },
        React.createElement(ReasoningTrigger, null),
        React.createElement(ReasoningContent, null, "กำลังวิเคราะห์โครงเรื่อง...")
      )
    );

    assert.ok(
      html.includes('data-slot="trace"'),
      "ต้องเรนเดอร์ Trace (data-slot='trace')"
    );
    assert.ok(
      html.includes('data-slot="trace-collapsible"'),
      "ต้องเรนเดอร์ TraceCollapsible (data-slot='trace-collapsible')"
    );
    assert.ok(
      html.includes('data-slot="trace-line"'),
      "ต้องเรนเดอร์ TraceLine (data-slot='trace-line')"
    );
    assert.ok(
      html.includes('data-status="running"'),
      "ขณะ isStreaming=true ต้องตั้งค่า status='running' บน TraceLine"
    );
    assert.ok(
      html.includes("Thinking"),
      "ขณะ isStreaming=true หัวข้อต้องแสดงคำว่า 'Thinking'"
    );
    assert.ok(
      html.includes('aria-expanded="true"'),
      "ขณะ isStreaming=true ต้องเปิดอัตโนมัติ (aria-expanded='true')"
    );
  });

  await test("5. ทดสอบการเรนเดอร์ Reasoning เมื่อสตรีมเสร็จสิ้น (isStreaming=false, duration=5 -> 'Thought for 5s', ปิดอัตโนมัติ)", async () => {
    const { Reasoning, ReasoningTrigger, ReasoningContent } = reasoningMod;

    const html = renderToStaticMarkup(
      React.createElement(
        Reasoning,
        { isStreaming: false, duration: 5 },
        React.createElement(ReasoningTrigger, null),
        React.createElement(ReasoningContent, null, "วิเคราะห์เสร็จสมบูรณ์")
      )
    );

    assert.ok(
      !html.includes('data-status="running"'),
      "เมื่อ isStreaming=false ต้องไม่มี data-status='running'"
    );
    assert.ok(
      html.includes("Thought for 5s"),
      "เมื่อมี duration=5 ต้องแสดงข้อความ 'Thought for 5s'"
    );
    assert.ok(
      html.includes('aria-expanded="false"'),
      "เมื่อ isStreaming=false และไม่ได้สั่งเปิด ต้องพับเก็บอัตโนมัติ (aria-expanded='false')"
    );
  });

  await test("6. ทดสอบการควบคุมสถานะเปิด/ปิด (open=true และ defaultOpen=true)", async () => {
    const { Reasoning, ReasoningTrigger, ReasoningContent } = reasoningMod;

    const htmlDefaultOpen = renderToStaticMarkup(
      React.createElement(
        Reasoning,
        { isStreaming: false, defaultOpen: true, duration: 12 },
        React.createElement(ReasoningTrigger, null),
        React.createElement(ReasoningContent, null, "เนื้อหาความคิด")
      )
    );

    assert.ok(
      htmlDefaultOpen.includes('aria-expanded="true"'),
      "เมื่อกำหนด defaultOpen=true ต้องเปิดอยู่ (aria-expanded='true')"
    );
    assert.ok(
      htmlDefaultOpen.includes("Thought for 12s"),
      "ต้องแสดงเวลา Thought for 12s"
    );
  });

  cleanupTempFiles();

  console.log("\n========================================");
  console.log(`📊 ผลการทดสอบ Frontend: ผ่าน ${passed} ข้อ | ไม่ผ่าน ${failed} ข้อ`);
  console.log("========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  cleanupTempFiles();
  console.error(err);
  process.exit(1);
});
