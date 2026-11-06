/**
 * js/editor.js
 * จัดการ Text Editor, Formatting Toolbar, และระบบส่งออกไฟล์
 */

const NovelEditor = (function () {
  /**
   * จัดการคำสั่งการจัดรูปแบบ Rich Text (bold, italic, lists, etc.)
   */
  function executeFormatting(canvasEl, command, value = null) {
    if (!canvasEl) return;
    canvasEl.focus();
    document.execCommand(command, false, value);
    canvasEl.focus();
  }

  /**
   * สร้างชื่อไฟล์ส่งออกที่ปลอดภัย
   */
  function getSafeFilename(title, ext) {
    const cleanTitle = (title || "untitled-novel")
      .trim()
      .replace(/[\/\\?%*:|"<>]/g, "-")
      .replace(/\s+/g, "_")
      .slice(0, 50);
    const dateStr = new Date().toISOString().slice(0, 10);
    return `${cleanTitle}_${dateStr}.${ext}`;
  }

  /**
   * ดาวน์โหลดไฟล์จากเบราว์เซอร์
   */
  function triggerDownload(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  return {
    executeFormatting,
    getSafeFilename,
    triggerDownload,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = NovelEditor;
}
