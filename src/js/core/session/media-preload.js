/**
 * Study Session - Media Preload Helpers (Audio & Decoded Image LRU Cache)
 */

import { preloadWordAudio } from '../../services/audio.js';

const MAX_IMAGE_CACHE_SIZE = 60;
const PRELOAD_BATCH_SIZE = 2;
const sessionImageCache = new Map();

/**
 * Tải trước và giải mã hình ảnh vào GPU/Browser RAM cache
 */
export function preloadCardImage(src) {
  if (!src || typeof src !== 'string' || typeof Image === 'undefined') {
    return Promise.resolve(null);
  }
  if (sessionImageCache.has(src)) {
    const p = sessionImageCache.get(src);
    sessionImageCache.delete(src);
    sessionImageCache.set(src, p);
    return p;
  }

  if (sessionImageCache.size >= MAX_IMAGE_CACHE_SIZE) {
    const oldestKey = sessionImageCache.keys().next().value;
    sessionImageCache.delete(oldestKey);
  }

  const img = new Image();
  img.src = src;
  const promise = (img.decode ? img.decode() : new Promise((resolve) => {
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  })).then(() => img).catch(() => null);

  sessionImageCache.set(src, promise);
  return promise;
}

/**
 * Tải trước âm thanh cho thẻ hiện tại và thẻ kế tiếp
 */
export function preloadSessionAudio(cards, accent = 'us') {
  if (!cards || !Array.isArray(cards) || typeof Audio === 'undefined') return;
  const safeAccent = (accent || 'us').toLowerCase();
  cards.slice(0, PRELOAD_BATCH_SIZE).forEach(card => {
    if (card && card.word) {
      preloadWordAudio(card.word.trim(), safeAccent, card);
    }
  });
}

/**
 * Tải trước hình ảnh trong phiên học chỉ khi người dùng BẬT hiển thị hình ảnh
 */
export function preloadSessionImages(cards) {
  if (!cards || !Array.isArray(cards) || typeof Image === 'undefined') return;
  let isImageEnabled = false;
  try {
    const raw = localStorage.getItem('study_display_prefs');
    if (raw) isImageEnabled = JSON.parse(raw).showImage === true;
  } catch (e) {}

  if (!isImageEnabled) return;

  cards.slice(0, PRELOAD_BATCH_SIZE).forEach(card => {
    const src = card?.img || card?.image;
    if (src && typeof src === 'string') {
      preloadCardImage(src);
    }
  });
}
