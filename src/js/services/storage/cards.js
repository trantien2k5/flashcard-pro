/**
 * FSRS Card States & Review Operations Storage Domain
 */

import { LEGACY_ID_MAP } from '../../../data/index.js';
import { FSRS } from '../../core/fsrs.js';
import { STORES } from './idb.js';
import {
  STORAGE_KEYS,
  REVERSE_ID_MAP,
  storageCache,
  migrateLegacyCardStates,
  putToIdb,
  scheduleCardsLocalStorageSync
} from './state.js';
import { logReview } from './logs.js';

function createInitialCardRecord(cardId, overrides = {}) {
  return {
    id: cardId,
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 0, // State.New
    last_review: null,
    suspended: false,
    isLeech: false,
    history: [],
    ...overrides
  };
}

export function getAllCardStates() {
  if (storageCache.cards !== null) return storageCache.cards;
  try {
    if (typeof localStorage === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.CARDS);
    const parsed = data ? JSON.parse(data) : {};
    storageCache.cards = migrateLegacyCardStates(parsed);
    return storageCache.cards;
  } catch (e) {
    console.error('Error reading cards:', e);
    return {};
  }
}

export function getCardState(cardId) {
  if (!cardId) return null;
  const cards = getAllCardStates();
  // 1. Khớp trực tiếp ID
  if (cards[cardId]) return cards[cardId];
  // 2. Tra theo Canonical ID nếu cardId là Legacy ID
  const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[cardId]) || null;
  if (canonicalId && cards[canonicalId]) return cards[canonicalId];
  // 3. Tra theo Legacy ID nếu cardId là Canonical ID
  const legacyId = REVERSE_ID_MAP[cardId] || null;
  if (legacyId && cards[legacyId]) return cards[legacyId];
  return null;
}

/**
 * Chấm điểm và cập nhật trạng thái FSRS cho từ vựng (Single Source of Truth)
 * Tự động tính toán FSRS, lưu IndexedDB & ghi log nhật ký học tập
 */
export function applyCardReview({ card, rating, fsrsInstance = null, settings = {}, now = new Date(), logExtra = {} }) {
  if (!card || !card.id) return null;
  const fsrs = fsrsInstance || new FSRS(settings?.fsrsParams);
  const oldState = getCardState(card.id) || FSRS.createEmptyCard(card.id);
  const nextState = fsrs.calculateNextState(oldState, rating, now, {
    enableFuzz: settings?.enableFuzz !== false,
    leechThreshold: settings?.leechThreshold || 8,
    leechAction: settings?.leechAction || 'suspend'
  });

  saveCardState(nextState);

  logReview({
    cardId: card.id,
    word: card.word,
    rating: rating,
    oldState: oldState.state,
    newState: nextState.state,
    scheduledDays: nextState.scheduled_days,
    elapsedDays: nextState.elapsed_days,
    stability: nextState.stability,
    difficulty: nextState.difficulty,
    ...logExtra
  });

  return { oldState, nextState };
}

export function saveCardState(cardState) {
  if (!cardState || !cardState.id) return;
  try {
    const cards = getAllCardStates();
    const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[cardState.id]) || cardState.id;

    // Giới hạn history trong state để không làm phình to bộ nhớ
    const history = Array.isArray(cardState.history) ? cardState.history.slice(-10) : [];
    const normalizedState = { ...cardState, id: canonicalId, history };

    cards[canonicalId] = normalizedState;
    storageCache.cards = cards;
    storageCache.stateRevision++;

    // 1. Lưu trữ IndexedDB bền vững (First-class persistence, không block UI thread)
    putToIdb(STORES.CARDS, normalizedState, '[StorageManager] IndexedDB saveCardState error:');

    // 2. Backup LocalStorage thông minh dạng Debounce (Không serialize JSON đồng bộ gây giật lag khi đang lật thẻ)
    scheduleCardsLocalStorageSync();
  } catch (e) {
    console.error('Error saving card state:', e);
  }
}

export function saveMultipleCardStates(cardStatesMap) {
  if (!cardStatesMap || typeof cardStatesMap !== 'object') return;
  try {
    const cards = getAllCardStates();
    const normalizedMap = {};
    for (const [id, state] of Object.entries(cardStatesMap)) {
      const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[id]) || id;
      const history = Array.isArray(state.history) ? state.history.slice(-10) : [];
      const normalized = { ...state, id: canonicalId, history };
      cards[canonicalId] = normalized;
      normalizedMap[canonicalId] = normalized;
    }
    storageCache.cards = cards;
    storageCache.stateRevision++;

    if (storageCache.dbPromise) {
      storageCache.dbPromise.then(db => {
        if (!db) return;
        const tx = db.transaction(STORES.CARDS, 'readwrite');
        const store = tx.objectStore(STORES.CARDS);
        for (const card of Object.values(normalizedMap)) {
          store.put(card);
        }
      }).catch(() => {});
    }

    scheduleCardsLocalStorageSync();
  } catch (e) {
    console.error('Error saving batch cards:', e);
  }
}

/**
 * Tạm dừng thẻ (Suspend) - ẩn khỏi hàng đợi ôn tập
 */
export function suspendCard(cardId) {
  if (!cardId) return null;
  const existing = getCardState(cardId);
  const state = existing ? { ...existing, suspended: true } : createInitialCardRecord(cardId, { suspended: true });
  saveCardState(state);
  return state;
}

/**
 * Bỏ tạm dừng thẻ (Unsuspend)
 */
export function unsuspendCard(cardId) {
  if (!cardId) return null;
  const existing = getCardState(cardId);
  if (!existing) return null;
  const state = { ...existing, suspended: false };
  saveCardState(state);
  return state;
}

/**
 * Đặt lại cờ thẻ khó và đưa thẻ trở lại hàng đợi học tập
 */
export function resetLeechStatus(cardId) {
  if (!cardId) return null;
  const existing = getCardState(cardId);
  if (!existing) return null;
  const state = { ...existing, isLeech: false, lapses: 0, suspended: false };
  saveCardState(state);
  return state;
}

/**
 * Đảo trạng thái tạm dừng của thẻ
 */
export function toggleCardSuspended(cardId) {
  if (!cardId) return false;
  const state = getCardState(cardId);
  if (state && state.suspended) {
    unsuspendCard(cardId);
    return false;
  }
  suspendCard(cardId);
  return true;
}

/**
 * Đặt lại tiến độ thẻ về từ mới hoàn toàn (Reset / Forget)
 */
export function resetCardProgress(cardId) {
  if (!cardId) return null;
  const emptyState = createInitialCardRecord(cardId);
  saveCardState(emptyState);
  return emptyState;
}

/**
 * Kiểm tra xem thẻ có đang bị tạm dừng hay không
 */
export function isCardSuspended(cardId) {
  if (!cardId) return false;
  const state = getCardState(cardId);
  return Boolean(state && state.suspended === true);
}

