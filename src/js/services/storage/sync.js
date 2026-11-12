/**
 * Backup Export/Import, Safety Snapshot & Clear All Data Operations
 */

import { LEGACY_ID_MAP } from '../../../data/index.js';
import { getLocalDateKey } from '../../utils.js';
import { DEFAULT_SETTINGS, DEFAULT_STREAK_STATE } from '../../config.js';
import { STORES, putToStore } from './idb.js';
import {
  createNanoBackupPayload,
  normalizeCardState,
  normalizeBackupLog
} from './backup.js';
import {
  STORAGE_KEYS,
  storageCache,
  clearPendingSyncTimers,
  invalidateCache,
  bumpStateRevision
} from './state.js';
import { getAllCardStates } from './cards.js';
import {
  getSettings,
  getStudyLogs,
  getStudyTimeMap,
  getStreakState,
  saveStreakState
} from './logs.js';
import {
  getUserProgress,
  getCustomDecks,
  getUserProfile,
  saveUserProfile,
  getUserPreferences,
  saveUserPreferences
} from './user-data.js';

function writeBatchToIdbStore(db, storeName, items, warnLabel) {
  if (!db || !items || items.length === 0) return;
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) {
      if (item) store.put(item);
    }
  } catch (e) {
    console.warn(warnLabel, e);
  }
}

/**
 * Xuất bản sao lưu Nano FSRS siêu nhẹ (giảm 85-95% dung lượng, giữ 100% dữ liệu)
 */
export function exportCompactBackup() {
  return createNanoBackupPayload({
    allCardStates: getAllCardStates(),
    logs: getStudyLogs(),
    customDecks: getCustomDecks(),
    studyTimeMap: getStudyTimeMap(),
    userProgress: getUserProgress(),
    streakState: getStreakState(),
    userProfile: getUserProfile(),
    settings: getSettings(),
    preferences: getUserPreferences()
  });
}

export async function importBackup(backupData) {
  try {
    let data = backupData;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Dữ liệu file không hợp lệ (Không phải định dạng JSON)' };
    }

    // 1. Chuẩn hóa danh sách thẻ cards (Hỗ trợ cả Compact Tuple Array, Object {} và Legacy Array [])
    const rawCards = data.cards || data.c || {};
    const normalizedCards = {};
    if (Array.isArray(rawCards)) {
      rawCards.forEach(c => {
        if (c) {
          const norm = normalizeCardState(c, LEGACY_ID_MAP);
          if (norm) normalizedCards[norm.id] = norm;
        }
      });
    } else if (typeof rawCards === 'object') {
      for (const [id, c] of Object.entries(rawCards)) {
        if (c) {
          const norm = normalizeCardState({ id, ...c }, LEGACY_ID_MAP);
          if (norm) normalizedCards[norm.id] = norm;
        }
      }
    }

    if (Object.keys(normalizedCards).length > 0) {
      storageCache.cards = { ...(getAllCardStates() || {}), ...normalizedCards };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(storageCache.cards));
      }
    }

    // 2. Cài đặt người dùng (Settings)
    const rawSettings = data.settings || data.s;
    if (rawSettings && typeof rawSettings === 'object') {
      storageCache.settings = { ...(getSettings() || {}), ...rawSettings };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storageCache.settings));
      }
    }

    // 3. Lịch sử ôn tập (Logs) - Tự động Deduplicate & Chuyển đổi Tuple
    const rawLogs = data.logs || data.l || data.study_logs;
    if (Array.isArray(rawLogs)) {
      const existingLogs = getStudyLogs() || [];
      const logMap = new Map();

      [...existingLogs, ...rawLogs].forEach(item => {
        const l = normalizeBackupLog(item);
        if (l) {
          const cardKey = l.cardId || l.card_id || l.word || 'item';
          const timeKey = l.timestamp || l.review || '';
          const key = l.id ? String(l.id) : `${cardKey}_${timeKey}`;
          logMap.set(key, l);
        }
      });

      storageCache.logs = Array.from(logMap.values()).sort((a, b) => {
        const ta = a.timestamp || a.review ? new Date(a.timestamp || a.review).getTime() : 0;
        const tb = b.timestamp || b.review ? new Date(b.timestamp || b.review).getTime() : 0;
        return ta - tb;
      });

      try {
        const streak = getStreakState();
        const studiedSet = new Set(streak.studiedDates || []);
        for (const l of storageCache.logs) {
          const ts = l.timestamp || l.review;
          if (ts) {
            const k = getLocalDateKey(ts);
            if (k && /^\d{4}-\d{2}-\d{2}$/.test(k)) studiedSet.add(k);
          }
        }
        streak.studiedDates = Array.from(studiedSet);
        saveStreakState(streak);
      } catch (e) {}

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(storageCache.logs));
      }
    }

    // 4. Bộ đề tùy chỉnh (Custom Decks)
    const rawCustom = data.customDecks || data.d || data.custom_decks;
    if (Array.isArray(rawCustom)) {
      const existingDecks = getCustomDecks() || [];
      const deckMap = new Map();
      existingDecks.forEach(d => { if (d && d.id) deckMap.set(d.id, d); });
      rawCustom.forEach(d => { if (d && d.id) deckMap.set(d.id, d); });
      storageCache.customDecks = Array.from(deckMap.values());
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(storageCache.customDecks));
      }
    }

    // 5. Thời gian học (Study Time)
    const rawTime = data.studyTime || data.st || data.study_time;
    if (rawTime && typeof rawTime === 'object') {
      storageCache.timeMap = { ...(getStudyTimeMap() || {}), ...rawTime };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDY_TIME, JSON.stringify(storageCache.timeMap));
      }
    }

    // 6. Tiến độ người dùng & Ghim chủ đề (User Progress & Pinned Topics)
    const rawProgress = data.userProgress || data.up || data.user_progress;
    if (rawProgress && typeof rawProgress === 'object') {
      const curProgress = getUserProgress() || { completedSubtopics: [], pinnedTopics: [] };
      const incCompleted = Array.isArray(rawProgress.completedSubtopics) ? rawProgress.completedSubtopics : [];
      const incPinned = Array.isArray(rawProgress.pinnedTopics) ? rawProgress.pinnedTopics : [];

      storageCache.userProgress = {
        id: 'global_progress',
        completedSubtopics: Array.from(new Set([
          ...(Array.isArray(curProgress.completedSubtopics) ? curProgress.completedSubtopics : []),
          ...incCompleted
        ])),
        pinnedTopics: Array.from(new Set([
          ...(Array.isArray(curProgress.pinnedTopics) ? curProgress.pinnedTopics : []),
          ...incPinned
        ]))
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(storageCache.userProgress));
      }
    }

    // 7. Hồ sơ cá nhân & Tùy chọn học tập
    const rawProfile = data.profile || data.p;
    if (rawProfile && typeof rawProfile === 'object') {
      saveUserProfile(rawProfile);
    }

    const rawPrefs = data.prefs || data.preferences;
    if (rawPrefs && typeof rawPrefs === 'object') {
      saveUserPreferences(rawPrefs);
    }

    const rawPinnedDecks = data.pinnedDecks || data.pinned_decks;
    if (Array.isArray(rawPinnedDecks) && typeof localStorage !== 'undefined') {
      localStorage.setItem('fc_pro_pinned_decks', JSON.stringify(rawPinnedDecks));
    }

    // 7.5. Trạng thái Streak & Bảo vệ chuỗi ngày
    const rawStreak = data.streak || data.streakState;
    if (rawStreak && typeof rawStreak === 'object') {
      const curStreak = getStreakState();
      const mergedStudied = Array.from(new Set([
        ...(curStreak.studiedDates || []),
        ...(rawStreak.studiedDates || [])
      ]));
      saveStreakState({ ...DEFAULT_STREAK_STATE, ...rawStreak, studiedDates: mergedStudied });
    }

    // 8. Ghi đè đồng bộ vào IndexedDB bền vững
    if (storageCache.dbPromise) {
      const db = await storageCache.dbPromise;
      if (db) {
        if (storageCache.cards) {
          writeBatchToIdbStore(
            db,
            STORES.CARDS,
            Object.values(storageCache.cards).filter(c => c && c.id),
            '[StorageManager] Lỗi import Cards vào IndexedDB:'
          );
        }
        writeBatchToIdbStore(db, STORES.STUDY_LOGS, storageCache.logs, '[StorageManager] Lỗi import Logs vào IndexedDB:');
        writeBatchToIdbStore(
          db,
          STORES.CUSTOM_DECKS,
          (storageCache.customDecks || []).filter(d => d && d.id),
          '[StorageManager] Lỗi import Custom Decks vào IndexedDB:'
        );
        if (storageCache.timeMap) {
          const timeItems = Object.entries(storageCache.timeMap).map(([date, seconds]) => ({ date, seconds }));
          writeBatchToIdbStore(db, STORES.STUDY_TIME, timeItems, '[StorageManager] Lỗi import Study Time vào IndexedDB:');
        }
        if (storageCache.userProgress) {
          try {
            putToStore(db, STORES.USER_PROGRESS, storageCache.userProgress);
          } catch (e) {}
        }
      }
    }

    bumpStateRevision();
    return { success: true, count: Object.keys(normalizedCards).length };
  } catch (e) {
    console.error('Error importing backup:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Tự động chụp bản sao lưu bảo hiểm an toàn (Safety Snapshot) trước khi thao tác dữ liệu
 */
export function createSafetySnapshot() {
  try {
    const backup = exportCompactBackup();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SAFETY_SNAPSHOT, JSON.stringify({
        timestamp: Date.now(),
        date: new Date().toISOString(),
        data: backup
      }));
    }
    return true;
  } catch (e) {
    console.warn('[StorageManager] Failed to create safety snapshot:', e);
    return false;
  }
}

/**
 * Khôi phục bản sao lưu bảo hiểm gần nhất
 */
export async function restoreSafetySnapshot() {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_SNAPSHOT);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    if (snapshot && snapshot.data) {
      await importBackup(snapshot.data);
      return true;
    }
  } catch (e) {
    console.error('[StorageManager] Failed to restore safety snapshot:', e);
  }
  return false;
}

export async function clearAllData() {
  try {
    clearPendingSyncTimers();
    invalidateCache();
    storageCache.cards = {};
    storageCache.logs = [];
    storageCache.customDecks = [];
    storageCache.timeMap = {};
    storageCache.userProgress = { id: 'global_progress', completedSubtopics: [], pinnedTopics: [] };
    storageCache.streakState = { ...DEFAULT_STREAK_STATE };
    storageCache.settings = { ...DEFAULT_SETTINGS };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CARDS);
      localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_DECKS);
      localStorage.removeItem(STORAGE_KEYS.STUDY_TIME);
      localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.STREAK_STATE);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }

    if (storageCache.dbPromise) {
      const db = await storageCache.dbPromise;
      if (db) {
        for (const storeName of Object.values(STORES)) {
          try {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).clear();
          } catch (e) {}
        }
        try {
          const tx = db.transaction(STORES.SETTINGS, 'readwrite');
          tx.objectStore(STORES.SETTINGS).put({ key: 'user_settings', ...DEFAULT_SETTINGS });
        } catch (e) {}
      }
    }

    return true;
  } catch (e) {
    console.error('Error clearing data:', e);
    return false;
  }
}

