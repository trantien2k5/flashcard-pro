/**
 * Deck Statistics, Due/Weak/Leech Cards Selectors
 */

import { StorageManager } from '../../services/storage.js';
import { FSRS, State, isCardDue } from '../fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../../config.js';

function hydrateCardWithWordMap(wordsMap, deckId, card, state) {
  return {
    ...(wordsMap.get(`${card.deckId || deckId}:${card.id}`) || wordsMap.get(card.id) || card),
    fsrsState: state
  };
}

/**
 * Lấy danh sách thẻ tới hạn cần ôn tập (Bỏ qua thẻ bị tạm dừng)
 */
export function selectDueCards({ deckCardsMap, allCards, wordsMap, deckId = null }) {
  const allDeckCards = deckId ? (deckCardsMap.get(deckId) || []) : allCards;
  const now = new Date();
  const dueCards = [];

  for (const card of allDeckCards) {
    const state = StorageManager.getCardState(card.id);
    if (state && state.suspended === true) continue;
    if (isCardDue(state, now)) {
      dueCards.push(hydrateCardWithWordMap(wordsMap, deckId, card, state));
    }
  }
  return dueCards;
}

/**
 * Lấy danh sách từ vựng yếu / hay quên nhất ("Bệnh Án Từ Vựng")
 * Tiêu chí: Từng bị quên lapses >= 2 hoặc có xác suất nhớ R(t) < 0.65 hoặc isLeech === true
 */
export function selectWeakWords({ allCards, wordsMap, limit = 10 }) {
  const now = new Date();
  const fsrsInstance = new FSRS();
  const weakList = [];

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (!state || state.state === State.New || state.state === 0 || state.suspended) {
      continue;
    }

    const lapses = Number(state.lapses) || 0;
    const isLeech = Boolean(state.isLeech || lapses >= 8);
    const r = fsrsInstance.getRetrievability(state, now);

    if (lapses >= 2 || isLeech || (state.reps >= 2 && r < 0.65)) {
      weakList.push({
        ...(wordsMap.get(`${card.deckId}:${card.id}`) || wordsMap.get(card.id) || card),
        fsrsState: state,
        _lapses: lapses,
        _isLeech: isLeech,
        _retrievability: r
      });
    }
  }

  weakList.sort((a, b) => {
    if (b._lapses !== a._lapses) return b._lapses - a._lapses;
    return a._retrievability - b._retrievability;
  });

  return weakList.slice(0, limit);
}

/**
 * Lấy danh sách từ khó (ngưỡng quên lapses >= 8 hoặc isLeech === true).
 * Ẩn thông báo thẻ tạm ẩn khỏi giao diện (vẫn xử lý ngầm trong FSRS & Storage).
 */
export function selectAttentionCards({ deckCardsMap, allCards, wordsMap, deckId = null }) {
  const targetCards = deckId ? (deckCardsMap.get(deckId) || []) : allCards;
  const difficultCards = [];
  const seenDifficult = new Set();

  for (const card of targetCards) {
    if (!card || !card.id) continue;
    const state = StorageManager.getCardState(card.id);
    if (!state || state.suspended === true) continue;

    const lapses = Number(state.lapses) || 0;
    const isLeech = Boolean(state.isLeech === true || lapses >= 8);

    if (isLeech && !seenDifficult.has(card.id)) {
      seenDifficult.add(card.id);
      const fullCard = hydrateCardWithWordMap(wordsMap, deckId, card, state);
      difficultCards.push({
        ...fullCard,
        _lapses: lapses,
        _isLeech: true,
        _isSuspended: false
      });
    }
  }

  difficultCards.sort((a, b) => (b._lapses || 0) - (a._lapses || 0));

  return {
    difficultCards,
    lapsedCards: difficultCards,
    suspendedCards: [],
    allCards: difficultCards,
    totalCount: difficultCards.length
  };
}

/**
 * Tính toán thống kê tiến độ học của một bộ thẻ (New, Learning, Review, Mastered, Leech, Suspended)
 */
export function computeDeckStats(cards) {
  const now = new Date();
  let newCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let dueCount = 0;
  let masteredCount = 0;
  let leechCount = 0;
  let suspendedCount = 0;
  let lastStudiedTime = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const state = StorageManager.getCardState(card.id);
    if (state && state.suspended === true) suspendedCount++;
    if (state && state.isLeech === true) leechCount++;

    if (!state || state.state === State.New || state.state === 0) {
      newCount++;
      continue;
    }

    if (state.last_review) {
      const t = Date.parse(state.last_review) || 0;
      if (t > lastStudiedTime) lastStudiedTime = t;
    }

    if (state.state === State.Learning || state.state === State.Relearning) {
      learningCount++;
      if (isCardDue(state, now) && !state.suspended) dueCount++;
    } else if (state.state === State.Review) {
      reviewCount++;
      if (state.stability >= MASTERY_STABILITY_THRESHOLD) {
        masteredCount++;
      }
      if (isCardDue(state, now) && !state.suspended) dueCount++;
    }
  }

  return {
    total: cards.length,
    newCount,
    learningCount,
    reviewCount,
    masteredCount,
    dueCount,
    leechCount,
    suspendedCount,
    lastStudiedTime,
    progressPercent: cards.length > 0 ? Math.round(((cards.length - newCount) / cards.length) * 100) : 0
  };
}

