/**
 * Data Sanitization & Security Utilities
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
