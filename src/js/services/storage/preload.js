/**
 * IndexedDB Storage Initialization & Preload Reconciliation
 */

import { getLocalDateKey } from '../../utils.js';
import { DEFAULT_SETTINGS, DEFAULT_STREAK_STATE } from '../../config.js';
import { STORES, openIndexedDB, getAllFromStore } from './idb.js';
import { storageCache } from './state.js';
import { getStreakState, saveStreakState } from './logs.js';

function reconcileCardsFromIdb(cards) {
  if (!cards || cards.length === 0) return;
  if (!storageCache.cards) {
    const cardsMap = {};
    for (const card of cards) {
      if (card && card.id) cardsMap[card.id] = card;
    }
    storageCache.cards = cardsMap;
    return;
  }
  for (const card of cards) {
    if (!card || !card.id) continue;
    const existing = storageCache.cards[card.id];
    if (!existing) {
      storageCache.cards[card.id] = card;
    } else {
      const idbReps = card.reps || 0;
      const localReps = existing.reps || 0;
      const idbTime = card.last_review ? new Date(card.last_review).getTime() : 0;
      const localTime = existing.last_review ? new Date(existing.last_review).getTime() : 0;
      if (idbReps > localReps || (idbReps === localReps && idbTime > localTime)) {
        storageCache.cards[card.id] = card;
      }
    }
  }
}

function mergeStudiedDatesFromTimestamps(timestamps) {
  try {
    const streak = getStreakState();
    const studiedSet = new Set(streak.studiedDates || []);
    let added = false;
    for (const ts of timestamps) {
      if (!ts) continue;
      const k = /^\d{4}-\d{2}-\d{2}$/.test(ts) ? ts : getLocalDateKey(ts);
      if (k && /^\d{4}-\d{2}-\d{2}$/.test(k) && !studiedSet.has(k)) {
        studiedSet.add(k);
        added = true;
      }
    }
    if (added) {
      streak.studiedDates = Array.from(studiedSet);
      saveStreakState(streak);
    }
  } catch (e) {}
}

function reconcileLogsFromIdb(logs) {
  if (!logs || logs.length === 0) return;
  if (!storageCache.logs) {
    storageCache.logs = logs;
  } else {
    const seenKeys = new Set(storageCache.logs.map(l => l.id || `${l.cardId || l.card_id || 'item'}_${l.timestamp || l.review_time || ''}`));
    for (const log of logs) {
      const key = log.id || `${log.cardId || log.card_id || 'item'}_${log.timestamp || log.review_time || ''}`;
      if (!seenKeys.has(key)) {
        storageCache.logs.push(log);
        seenKeys.add(key);
      }
    }
  }
  storageCache.logs.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  mergeStudiedDatesFromTimestamps(logs.map(l => l.timestamp || l.review || l.review_time || l.date));
}

function reconcileStudyTimeFromIdb(studyTime) {
  if (!studyTime || studyTime.length === 0) return;
  if (!storageCache.timeMap) {
    const timeObj = {};
    for (const item of studyTime) {
      const dateKey = item.date || item.id;
      if (dateKey) timeObj[dateKey] = item.seconds || 0;
    }
    storageCache.timeMap = timeObj;
  } else {
    for (const item of studyTime) {
      const dateKey = item.date || item.id;
      if (dateKey) {
        storageCache.timeMap[dateKey] = Math.max(storageCache.timeMap[dateKey] || 0, item.seconds || 0);
      }
    }
  }

  const validDates = Object.entries(storageCache.timeMap)
    .filter(([d, s]) => Number(s) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .map(([d]) => d);
  mergeStudiedDatesFromTimestamps(validDates);
}

/**
 * Nạp trước dữ liệu từ IndexedDB vào RAM Cache và hòa giải với LocalStorage
 */
export async function preloadFromIndexedDB(db) {
  try {
    if (!db) return;

    const [cards, logs, settings, customDecks, studyTime, userProgress] = await Promise.all([
      getAllFromStore(db, STORES.CARDS),
      getAllFromStore(db, STORES.STUDY_LOGS),
      getAllFromStore(db, STORES.SETTINGS),
      getAllFromStore(db, STORES.CUSTOM_DECKS),
      getAllFromStore(db, STORES.STUDY_TIME),
      getAllFromStore(db, STORES.USER_PROGRESS)
    ]);

    reconcileCardsFromIdb(cards);
    reconcileLogsFromIdb(logs);

    if (settings && settings.length > 0) {
      if (!storageCache.settings) {
        const found = settings.find(s => s.key === 'user_settings');
        if (found) {
          const { key, ...rest } = found;
          storageCache.settings = { ...DEFAULT_SETTINGS, ...rest };
        }
      }
      if (!storageCache.streakState) {
        const foundStreak = settings.find(s => s.key === 'streak_state');
        if (foundStreak) {
          const { key, ...rest } = foundStreak;
          storageCache.streakState = { ...DEFAULT_STREAK_STATE, ...rest };
        }
      }
    }

    if (customDecks && customDecks.length > 0) {
      if (!storageCache.customDecks) {
        storageCache.customDecks = customDecks;
      } else {
        const deckMap = new Map(storageCache.customDecks.map(d => [d.id, d]));
        for (const d of customDecks) {
          if (d && d.id && !deckMap.has(d.id)) {
            storageCache.customDecks.push(d);
          }
        }
      }
    }

    reconcileStudyTimeFromIdb(studyTime);

    if (userProgress && userProgress.length > 0 && !storageCache.userProgress) {
      const prog = userProgress.find(p => p.id === 'global_progress') || userProgress[0];
      if (prog) storageCache.userProgress = prog;
    }

    if (typeof window !== 'undefined' && window.app && typeof window.app.updateHeaderBadges === 'function') {
      window.app.updateHeaderBadges();
    }
  } catch (e) {}
}

/**
 * Khởi tạo kết nối IndexedDB và nạp trước dữ liệu vào RAM Cache
 */
export async function initStorage() {
  try {
    if (typeof window !== 'undefined' && window.indexedDB && !storageCache.dbPromise) {
      storageCache.dbPromise = openIndexedDB();
    }

    if (storageCache.dbPromise) {
      const db = await storageCache.dbPromise;
      if (db) {
        await preloadFromIndexedDB(db);
      }
    }
  } catch (err) {
    console.warn('[StorageManager] Lỗi khởi tạo IndexedDB:', err);
  }
}

