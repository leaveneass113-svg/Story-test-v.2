/**
 * backend/src/server.js
 * เซิร์ฟเวอร์หลัก Express สำหรับ Novel AI Chat & Co-Writer
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const chatRoutes = require('./routes/chat-routes');
const healthRoutes = require('./routes/health-routes');

const app = express();

// ================= Middlewares =================
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger ย่อ
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (!req.path.startsWith('/static')) {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ================= API Routes =================
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

// ================= Static Files (Frontend & Shared) =================
// บริการไฟล์หน้าบ้านจาก frontend และ shared เพื่อให้สามารถเปิด http://localhost:3001 ได้โดยตรง
const frontendPath = path.resolve(__dirname, '../../frontend');
const sharedPath = path.resolve(__dirname, '../../shared');

app.use(express.static(frontendPath));
app.use('/shared', express.static(sharedPath));

// Fallback Route สำหรับหน้าเว็บ
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ================= Error Handler =================
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ================= Start Server =================
let server = null;

function startServer(port = config.port) {
  if (server) return server;
  server = app.listen(port, () => {
    console.log('========================================================');
    console.log('🚀 Novel AI Backend Server ทำงานสำเร็จแล้ว!');
    console.log(`📡 URL เซิร์ฟเวอร์: http://localhost:${port}`);
    console.log(`🔌 Health Check:  http://localhost:${port}/api/health`);
    console.log(`💬 Stream Endpoint: POST http://localhost:${port}/api/chat/stream`);
    console.log(`🗄️ Supabase URL:   ${config.supabase.url || '(ยังไม่ได้ระบุ)'}`);
    console.log(`🤖 AI Provider:    ${config.ai.provider} (${config.ai.defaultModel})`);
    console.log('========================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  พอร์ต ${port} กำลังถูกโปรเซสอื่นใช้งานอยู่ (EADDRINUSE)`);
      console.error(`👉 คำแนะนำ: มี Node.js ตัวเดิมเปิดค้างอยู่ ให้กด Ctrl+C ในหน้าต่างเดิม หรือปิดโปรเซสที่ค้างอยู่\n`);
      process.exit(1);
    } else {
      console.error('[Server Listen Error]', err);
    }
  });

  return server;
}

// Graceful Shutdown ปิด Socket เมื่อกด Ctrl+C เพื่อป้องกันพอร์ตค้าง
process.on('SIGINT', () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

if (require.main === module) {
  startServer(config.port);
}

module.exports = { app, server, startServer };
