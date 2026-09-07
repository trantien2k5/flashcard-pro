/**
 * Shared Helper Utilities for Flashcard Pro
 */

/**
 * Escape HTML to prevent XSS in dynamic rendering
 */
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

/**
 * Validate and safely sanitize CSS color value
 */
export function safeColor(value, fallback = '#6366f1') {
  const color = String(value || '').trim();
  return /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s.,%]+\)|hsl(a)?\([\d\s.,%]+\)|[a-z]+)$/i.test(color) ? color : fallback;
}

/**
 * Standard debounce utility for input event throttling
 */
export function debounce(fn, delay = 150) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format seconds into mm:ss or hh:mm:ss string
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
 * Format date to Vietnamese locale string (e.g., "07/09/2026")
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
