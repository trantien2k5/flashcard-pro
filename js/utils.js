/**
 * Flashcard English Pro - Core Utilities
 * Consolidates DOM, Async, Format, Sanitization & Helpers
 */

/**
 * Escape HTML special characters to prevent XSS injection
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
 * Validate and safely sanitize CSS color strings
 */
export function safeColor(value, fallback = '#6366f1') {
  const color = String(value || '').trim();
  return /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s.,%]+\)|hsl(a)?\([\d\s.,%]+\)|[a-z]+)$/i.test(color) ? color : fallback;
}

/**
 * Escape special characters for safe regular expression usage
 */
export function escapeRegex(string) {
  return String(string || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

/**
 * Detect whether current client has touch capability
 */
export function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
}

/**
 * Smoothly scroll window or container to top
 */
export function scrollToTop(target = window, smooth = true) {
  if (target === window) {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  } else if (target && typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  }
}

/**
 * Highlight keywords in text with <mark> tags safely
 */
export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return escapeHTML(text || '');
  const escapedText = escapeHTML(text);
  const escapedKeyword = escapeRegex(escapeHTML(keyword));
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
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
 * Throttle utility to limit execution rate
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Gắn sự kiện đóng Modal khi click ra ngoài backdrop hoặc bấm phím Escape
 * @param {HTMLElement} modalEl - Element backdrop modal
 * @param {Function} closeCallback - Hàm callback khi đóng
 * @returns {Function} Hàm unbind gỡ bỏ sự kiện
 */
export function bindModalBackdropAndEsc(modalEl, closeCallback) {
  if (!modalEl || typeof closeCallback !== 'function') return () => {};

  const handleBackdrop = (e) => {
    if (e.target === modalEl) {
      closeCallback(e);
    }
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeCallback(e);
    }
  };

  modalEl.addEventListener('click', handleBackdrop);
  window.addEventListener('keydown', handleEsc);

  return () => {
    modalEl.removeEventListener('click', handleBackdrop);
    window.removeEventListener('keydown', handleEsc);
  };
}

/**
 * Promise-based delay sleep helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
