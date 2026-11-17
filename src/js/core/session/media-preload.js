/**
 * Study Session - Media Preload Helpers (Audio Preload)
 */

import { preloadWordAudio } from '../../services/audio.js';

const PRELOAD_BATCH_SIZE = 2;

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
