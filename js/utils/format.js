/**
 * String, Number, Time & Date Formatting Utilities
 */

/**
 * Format elapsed seconds into mm:ss or hh:mm:ss
 */
export function formatTime(seconds = 0) {
  const sec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM < 10 ? '0' : ''}${remM}m`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Format date to Vietnamese locale string (e.g. "08/09/2026")
 */
export function formatDate(date) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format numbers with Vietnamese thousand separators (e.g. 1.250)
 */
export function formatNumber(num = 0) {
  const n = Number(num) || 0;
  return n.toLocaleString('vi-VN');
}

/**
 * Clean FSRS interval string (strips <, ≤, spaces for concise button labels)
 */
export function formatCleanInterval(text, fallback = '1d') {
  return (text || fallback).toString().replace(/^[<≤\s]+/, '').trim();
}

/**
 * Lấy khóa ngày dạng YYYY-MM-DD theo giờ địa phương của thiết bị (chống lệch múi giờ UTC)
 */
export function getLocalDateKey(date = new Date()) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
