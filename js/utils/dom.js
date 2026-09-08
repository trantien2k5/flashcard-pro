/**
 * DOM & Device Helper Utilities
 */
import { escapeRegex, escapeHTML } from './sanitize.js';

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
