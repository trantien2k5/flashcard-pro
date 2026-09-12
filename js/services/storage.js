/**
 * Storage Service for FSRS Progress, Decks, User Settings & Review Logs
 * Thuần Client-side: Lưu trữ bền vững với IndexedDB kết hợp RAM Cache và LocalStorage fallback.
 */

import { LEGACY_ID_MAP } from '../../data/index.js';
import { getLocalDateKey } from '../utils.js';
import { DEFAULT_SETTINGS, APP_CONFIG } from '../config.js';

export { DEFAULT_SETTINGS };

const DB_NAME = APP_CONFIG.dbName || 'FlashcardProDB';
const DB_VERSION = APP_CONFIG.dbVersion || 1;

const STORES = {
  CARDS: 'cards',
  STUDY_LOGS: 'study_logs',
  SETTINGS: 'settings',
  CUSTOM_DECKS: 'custom_decks',
  STUDY_TIME: 'study_time',
  USER_PROGRESS: 'user_progress'
};

const STORAGE_KEYS = {
  CARDS: 'fsrs_card_states_v1',
  SETTINGS: 'fsrs_user_settings_v1',
  CUSTOM_DECKS: 'fsrs_custom_decks_v1',
  STUDY_LOGS: 'fsrs_study_logs_v1',
  STUDY_TIME: 'fsrs_study_time_v1',
  USER_PROGRESS: 'fsrs_user_progress_v1',
  SAFETY_SNAPSHOT: 'fsrs_safety_snapshot_v1'
};

let _cardsCache = null;
let _settingsCache = null;
let _logsCache = null;
let _timeMapCache = null;
let _customDecksCache = null;
let _userProgressCache = null;
let _dbPromise = null;
let _stateRevision = 1;

// Map ngược để tra cứu 2 chiều Canonical ID ⇋ Legacy ID
const REVERSE_ID_MAP = {};
if (typeof LEGACY_ID_MAP === 'object' && LEGACY_ID_MAP !== null) {
  for (const [legId, canId] of Object.entries(LEGACY_ID_MAP)) {
    REVERSE_ID_MAP[canId] = legId;
  }
}

/**
 * Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn sau khi deduplicate
 */
function migrateLegacyCardStates(rawCards) {
  if (!rawCards || typeof rawCards !== 'object') return {};
  if (!LEGACY_ID_MAP || Object.keys(LEGACY_ID_MAP).length === 0) return rawCards;

  let migrated = false;
  const cards = { ...rawCards };

  for (const [legacyId, canonicalId] of Object.entries(LEGACY_ID_MAP)) {
    if (cards[legacyId]) {
      const legacyState = cards[legacyId];
      if (!cards[canonicalId]) {
        cards[canonicalId] = { ...legacyState, id: canonicalId };
      } else {
        const canReps = cards[canonicalId].reps || 0;
        const legReps = legacyState.reps || 0;
        if (legReps > canReps) {
          cards[canonicalId] = { ...legacyState, id: canonicalId };
        }
      }
      delete cards[legacyId];
      migrated = true;
    }
  }

  if (migrated && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {}
  }

  return cards;
}

export class StorageManager {
  static getStateRevision() {
    return _stateRevision;
  }

  static bumpStateRevision() {
    _stateRevision++;
  }

  /**
   * Khởi tạo kết nối IndexedDB và nạp trước dữ liệu vào RAM Cache
   */
  static async initStorage() {
    try {
      if (typeof window !== 'undefined' && window.indexedDB && !_dbPromise) {
        _dbPromise = new Promise((resolve) => {
          try {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
              try {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORES.CARDS)) {
                  db.createObjectStore(STORES.CARDS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.STUDY_LOGS)) {
                  const logStore = db.createObjectStore(STORES.STUDY_LOGS, { keyPath: 'id', autoIncrement: true });
                  logStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                  db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains(STORES.CUSTOM_DECKS)) {
                  db.createObjectStore(STORES.CUSTOM_DECKS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.STUDY_TIME)) {
                  db.createObjectStore(STORES.STUDY_TIME, { keyPath: 'date' });
                }
                if (!db.objectStoreNames.contains(STORES.USER_PROGRESS)) {
                  db.createObjectStore(STORES.USER_PROGRESS, { keyPath: 'id' });
                }
              } catch (e) {
                console.warn('[StorageManager] onupgradeneeded error:', e);
              }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => {
              console.warn('[StorageManager] IndexedDB open error:', e);
              resolve(null);
            };
          } catch (e) {
            console.warn('[StorageManager] IndexedDB exception:', e);
            resolve(null);
          }
        });
      }

      if (_dbPromise) {
        const db = await _dbPromise;
        if (db) {
          await this._preloadFromIndexedDB(db);
        }
      }
    } catch (err) {
      console.warn('[StorageManager] Lỗi khởi tạo IndexedDB:', err);
    }
  }

  static async _preloadFromIndexedDB(db) {
    try {
      if (!db) return;

      const [cards, logs, settings, customDecks, studyTime, userProgress] = await Promise.all([
        this._getAllFromStore(db, STORES.CARDS),
        this._getAllFromStore(db, STORES.STUDY_LOGS),
        this._getAllFromStore(db, STORES.SETTINGS),
        this._getAllFromStore(db, STORES.CUSTOM_DECKS),
        this._getAllFromStore(db, STORES.STUDY_TIME),
        this._getAllFromStore(db, STORES.USER_PROGRESS)
      ]);

      if (cards && cards.length > 0 && !_cardsCache) {
        const cardsMap = {};
        for (const card of cards) cardsMap[card.id] = card;
        _cardsCache = cardsMap;
      }

      if (logs && logs.length > 0 && !_logsCache) {
        _logsCache = logs;
      }

      if (settings && settings.length > 0 && !_settingsCache) {
        const found = settings.find(s => s.key === 'user_settings');
        if (found) {
          const { key, ...rest } = found;
          _settingsCache = { ...DEFAULT_SETTINGS, ...rest };
        }
      }

      if (customDecks && customDecks.length > 0 && !_customDecksCache) {
        _customDecksCache = customDecks;
      }

      if (studyTime && studyTime.length > 0 && !_timeMapCache) {
        const timeObj = {};
        for (const item of studyTime) {
          const dateKey = item.date || item.id;
          if (dateKey) timeObj[dateKey] = item.seconds || 0;
        }
        _timeMapCache = timeObj;
      }

      if (userProgress && userProgress.length > 0 && !_userProgressCache) {
        const prog = userProgress.find(p => p.id === 'global_progress') || userProgress[0];
        if (prog) _userProgressCache = prog;
      }
    } catch (e) {}
  }

  static _getAllFromStore(db, storeName) {
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(storeName)) return resolve([]);
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  static _putToStore(db, storeName, item) {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
    } catch (e) {}
  }

  static invalidateCache() {
    _cardsCache = null;
    _settingsCache = null;
    _logsCache = null;
    _timeMapCache = null;
    _customDecksCache = null;
  }

  static getSettings() {
    if (_settingsCache !== null) return _settingsCache;
    try {
      if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      _settingsCache = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
      return _settingsCache;
    } catch (e) {
      console.error('Error reading settings:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    try {
      _settingsCache = { ...settings };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.SETTINGS, { key: 'user_settings', ...settings });
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  static getAllCardStates() {
    if (_cardsCache !== null) return _cardsCache;
    try {
      if (typeof localStorage === 'undefined') return {};
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      const parsed = data ? JSON.parse(data) : {};
      _cardsCache = migrateLegacyCardStates(parsed);
      return _cardsCache;
    } catch (e) {
      console.error('Error reading cards:', e);
      return {};
    }
  }

  static getCardState(cardId) {
    if (!cardId) return null;
    const cards = this.getAllCardStates();
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

  static saveCardState(cardState) {
    if (!cardState || !cardState.id) return;
    try {
      const cards = this.getAllCardStates();
      const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[cardState.id]) || cardState.id;
      const normalizedState = { ...cardState, id: canonicalId };
      cards[canonicalId] = normalizedState;
      _cardsCache = cards;
      _stateRevision++;

      // Backup sang LocalStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      }

      // Lưu trữ IndexedDB bền vững
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.CARDS, normalizedState);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving card state:', e);
    }
  }

  static saveMultipleCardStates(cardStatesMap) {
    if (!cardStatesMap || typeof cardStatesMap !== 'object') return;
    try {
      const cards = this.getAllCardStates();
      const normalizedMap = {};
      for (const [id, state] of Object.entries(cardStatesMap)) {
        const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[id]) || id;
        const normalized = { ...state, id: canonicalId };
        cards[canonicalId] = normalized;
        normalizedMap[canonicalId] = normalized;
      }
      _cardsCache = cards;
      _stateRevision++;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      }

      if (_dbPromise) {
        _dbPromise.then(db => {
          const tx = db.transaction(STORES.CARDS, 'readwrite');
          const store = tx.objectStore(STORES.CARDS);
          for (const card of Object.values(normalizedMap)) {
            store.put(card);
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving batch cards:', e);
    }
  }

  static logReview(reviewEvent) {
    try {
      const logs = this.getStudyLogs();
      const logEntry = {
        ...reviewEvent,
        timestamp: new Date().toISOString()
      };
      logs.push(logEntry);

      if (logs.length > 5000) logs.splice(0, logs.length - 5000);
      _logsCache = logs;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs));
      }

      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.STUDY_LOGS, logEntry);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error logging review:', e);
    }
  }

  static getStudyLogs() {
    if (_logsCache !== null) return _logsCache;
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
      _logsCache = data ? JSON.parse(data) : [];
      return _logsCache;
    } catch (e) {
      console.error('Error reading logs:', e);
      return [];
    }
  }

  static getStudyTimeMap() {
    if (_timeMapCache !== null) return _timeMapCache;
    try {
      if (typeof localStorage === 'undefined') return {};
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_TIME);
      _timeMapCache = data ? JSON.parse(data) : {};
      return _timeMapCache;
    } catch (e) {
      console.error('Error reading study time:', e);
      return {};
    }
  }

  static getTodayStudySeconds() {
    const timeMap = this.getStudyTimeMap();
    const todayKey = getLocalDateKey();
    return timeMap[todayKey] || 0;
  }

  static addStudySeconds(seconds) {
    if (!seconds || seconds <= 0) return 0;
    try {
      const timeMap = this.getStudyTimeMap();
      const todayKey = getLocalDateKey();
      const current = timeMap[todayKey] || 0;
      const updated = current + Math.round(seconds);
      timeMap[todayKey] = updated;
      _timeMapCache = timeMap;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDY_TIME, JSON.stringify(timeMap));
      }
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.STUDY_TIME, { date: todayKey, seconds: updated });
        }).catch(() => {});
      }

      return updated;
    } catch (e) {
      console.error('Error saving study time:', e);
      return 0;
    }
  }

  // ==========================================
  // USER PROGRESS & SUBTOPIC UNLOCK MANAGEMENT
  // ==========================================

  static getUserProgress() {
    if (_userProgressCache !== null) return _userProgressCache;
    try {
      if (typeof localStorage === 'undefined') return { id: 'global_progress', completedSubtopics: [] };
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      _userProgressCache = data ? JSON.parse(data) : { id: 'global_progress', completedSubtopics: [] };
      return _userProgressCache;
    } catch (e) {
      console.error('Error reading user progress:', e);
      return { id: 'global_progress', completedSubtopics: [] };
    }
  }

  static saveUserProgress(progress) {
    try {
      _userProgressCache = { ...progress, id: 'global_progress' };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(_userProgressCache));
      }
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.USER_PROGRESS, _userProgressCache);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving user progress:', e);
    }
  }

  static completeSubtopic(subtopicId) {
    if (!subtopicId) return;
    const progress = this.getUserProgress();
    if (!Array.isArray(progress.completedSubtopics)) {
      progress.completedSubtopics = [];
    }
    if (!progress.completedSubtopics.includes(subtopicId)) {
      progress.completedSubtopics.push(subtopicId);
      this.saveUserProgress(progress);
    }
  }

  static isSubtopicCompleted(subtopicId) {
    if (!subtopicId) return false;
    const progress = this.getUserProgress();
    return Array.isArray(progress.completedSubtopics) && progress.completedSubtopics.includes(subtopicId);
  }

  // ==========================================
  // PINNED TOPICS (GHIM CHỦ ĐỀ YÊU THÍCH)
  // ==========================================

  static getPinnedTopicIds() {
    const progress = this.getUserProgress();
    if (!Array.isArray(progress.pinnedTopics)) {
      progress.pinnedTopics = [];
    }
    return progress.pinnedTopics;
  }

  static isTopicPinned(topicId) {
    if (!topicId) return false;
    const pinned = this.getPinnedTopicIds();
    return pinned.includes(topicId);
  }

  static togglePinTopic(topicId) {
    if (!topicId) return false;
    const progress = this.getUserProgress();
    if (!Array.isArray(progress.pinnedTopics)) {
      progress.pinnedTopics = [];
    }
    const idx = progress.pinnedTopics.indexOf(topicId);
    let isPinned = false;
    if (idx >= 0) {
      progress.pinnedTopics.splice(idx, 1);
      isPinned = false;
    } else {
      progress.pinnedTopics.push(topicId);
      isPinned = true;
    }
    this.saveUserProgress(progress);
    return isPinned;
  }

  static getCustomDecks() {
    if (_customDecksCache !== null) return _customDecksCache;
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS);
      _customDecksCache = data ? JSON.parse(data) : [];
      return _customDecksCache;
    } catch (e) {
      console.error('Error reading custom decks:', e);
      return [];
    }
  }

  static saveCustomDeck(deck) {
    try {
      const decks = this.getCustomDecks();
      const index = decks.findIndex(d => d.id === deck.id);
      if (index >= 0) {
        decks[index] = deck;
      } else {
        decks.push(deck);
      }
      _customDecksCache = decks;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
      }
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.CUSTOM_DECKS, deck);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving custom deck:', e);
    }
  }

  static deleteCustomDeck(deckId) {
    try {
      let decks = this.getCustomDecks();
      decks = decks.filter(d => d.id !== deckId);
      _customDecksCache = decks;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
      }
      if (_dbPromise) {
        _dbPromise.then(db => {
          try {
            const tx = db.transaction(STORES.CUSTOM_DECKS, 'readwrite');
            tx.objectStore(STORES.CUSTOM_DECKS).delete(deckId);
          } catch (e) {}
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error deleting custom deck:', e);
    }
  }

  /**
   * Tự động chụp bản sao lưu bảo hiểm an toàn (Safety Snapshot) trước khi thao tác dữ liệu
   */
  static createSafetySnapshot() {
    try {
      const backup = this.exportBackup();
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
  static async restoreSafetySnapshot() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_SNAPSHOT);
      if (!raw) return false;
      const snapshot = JSON.parse(raw);
      if (snapshot && snapshot.data) {
        await this.importBackup(snapshot.data);
        return true;
      }
    } catch (e) {
      console.error('[StorageManager] Failed to restore safety snapshot:', e);
    }
    return false;
  }

  static exportBackup() {
    return {
      version: '2.0',
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      cards: this.getAllCardStates(),
      logs: this.getStudyLogs(),
      customDecks: this.getCustomDecks(),
      studyTime: this.getStudyTimeMap()
    };
  }

  static _normalizeCardState(raw) {
    if (!raw || typeof raw !== 'object') return null;
    let due = raw.due || raw.du || null;
    if (due && typeof due === 'number') {
      due = new Date(due).toISOString();
    }
    const id = raw.id;
    if (!id) return null;
    const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[id]) || id;

    return {
      id: canonicalId,
      state: raw.state ?? raw.s ?? 0,
      reps: raw.reps ?? raw.r ?? 0,
      lapses: raw.lapses ?? raw.l ?? 0,
      stability: raw.stability ?? raw.st ?? 0,
      difficulty: raw.difficulty ?? raw.d ?? 0,
      due: due,
      last_review: raw.last_review ?? raw.lr ?? null,
      elapsed_days: raw.elapsed_days ?? 0,
      scheduled_days: raw.scheduled_days ?? 0
    };
  }

  static async importBackup(backupData) {
    try {
      let data = backupData;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Dữ liệu file không hợp lệ (Không phải định dạng JSON)' };
      }

      // 1. Chuẩn hóa danh sách thẻ cards (Hỗ trợ cả Object {} và Array [])
      const rawCards = data.cards || data.c || {};
      const normalizedCards = {};
      if (Array.isArray(rawCards)) {
        rawCards.forEach(c => {
          if (c && c.id) {
            const norm = this._normalizeCardState(c);
            if (norm) normalizedCards[norm.id] = norm;
          }
        });
      } else if (typeof rawCards === 'object') {
        for (const [id, c] of Object.entries(rawCards)) {
          if (c) {
            const norm = this._normalizeCardState({ id, ...c });
            if (norm) normalizedCards[norm.id] = norm;
          }
        }
      }

      if (Object.keys(normalizedCards).length > 0) {
        _cardsCache = { ...(this.getAllCardStates() || {}), ...normalizedCards };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(_cardsCache));
        }
      }

      // 2. Cài đặt người dùng (Settings)
      const rawSettings = data.settings || data.s;
      if (rawSettings && typeof rawSettings === 'object') {
        _settingsCache = { ...(this.getSettings() || {}), ...rawSettings };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(_settingsCache));
        }
      }

      // 3. Lịch sử ôn tập (Logs) - Tự động Deduplicate
      const rawLogs = data.logs || data.study_logs;
      if (Array.isArray(rawLogs)) {
        const existingLogs = this.getStudyLogs() || [];
        const logMap = new Map();
        [...existingLogs, ...rawLogs].forEach(l => {
          if (l) {
            const cardKey = l.cardId || l.card_id || l.word || 'item';
            const timeKey = l.timestamp || l.review || '';
            const key = l.id ? String(l.id) : `${cardKey}_${timeKey}`;
            logMap.set(key, l);
          }
        });
        _logsCache = Array.from(logMap.values()).sort((a, b) => {
          const ta = a.timestamp || a.review ? new Date(a.timestamp || a.review).getTime() : 0;
          const tb = b.timestamp || b.review ? new Date(b.timestamp || b.review).getTime() : 0;
          return ta - tb;
        });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(_logsCache));
        }
      }

      // 4. Bộ đề tùy chỉnh (Custom Decks)
      const rawCustom = data.customDecks || data.custom_decks;
      if (Array.isArray(rawCustom)) {
        const existingDecks = this.getCustomDecks() || [];
        const deckMap = new Map();
        existingDecks.forEach(d => { if (d && d.id) deckMap.set(d.id, d); });
        rawCustom.forEach(d => { if (d && d.id) deckMap.set(d.id, d); });
        _customDecksCache = Array.from(deckMap.values());
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(_customDecksCache));
        }
      }

      // 5. Thời gian học (Study Time)
      const rawTime = data.studyTime || data.study_time;
      if (rawTime && typeof rawTime === 'object') {
        _timeMapCache = { ...(this.getStudyTimeMap() || {}), ...rawTime };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.STUDY_TIME, JSON.stringify(_timeMapCache));
        }
      }

      // 6. Ghi đè đồng bộ vào IndexedDB bền vững
      if (_dbPromise) {
        const db = await _dbPromise;
        if (db) {
          if (_cardsCache) {
            try {
              const tx = db.transaction(STORES.CARDS, 'readwrite');
              const store = tx.objectStore(STORES.CARDS);
              for (const card of Object.values(_cardsCache)) {
                if (card && card.id) store.put(card);
              }
            } catch (e) {
              console.warn('[StorageManager] Lỗi import Cards vào IndexedDB:', e);
            }
          }

          if (_logsCache && _logsCache.length > 0) {
            try {
              const tx = db.transaction(STORES.STUDY_LOGS, 'readwrite');
              const store = tx.objectStore(STORES.STUDY_LOGS);
              for (const log of _logsCache) {
                store.put(log);
              }
            } catch (e) {
              console.warn('[StorageManager] Lỗi import Logs vào IndexedDB:', e);
            }
          }

          if (_customDecksCache && _customDecksCache.length > 0) {
            try {
              const tx = db.transaction(STORES.CUSTOM_DECKS, 'readwrite');
              const store = tx.objectStore(STORES.CUSTOM_DECKS);
              for (const deck of _customDecksCache) {
                if (deck && deck.id) store.put(deck);
              }
            } catch (e) {
              console.warn('[StorageManager] Lỗi import Custom Decks vào IndexedDB:', e);
            }
          }

          if (_timeMapCache) {
            try {
              const tx = db.transaction(STORES.STUDY_TIME, 'readwrite');
              const store = tx.objectStore(STORES.STUDY_TIME);
              for (const [date, seconds] of Object.entries(_timeMapCache)) {
                store.put({ date, seconds });
              }
            } catch (e) {
              console.warn('[StorageManager] Lỗi import Study Time vào IndexedDB:', e);
            }
          }
        }
      }

      this.bumpStateRevision();
      return { success: true, count: Object.keys(normalizedCards).length };
    } catch (e) {
      console.error('Error importing backup:', e);
      return { success: false, error: e.message };
    }
  }

  static async clearAllData() {
    try {
      this.invalidateCache();
      _cardsCache = {};
      _logsCache = [];
      _customDecksCache = [];
      _timeMapCache = {};
      _settingsCache = { ...DEFAULT_SETTINGS };

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.CARDS);
        localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_DECKS);
        localStorage.removeItem(STORAGE_KEYS.STUDY_TIME);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      if (_dbPromise) {
        const db = await _dbPromise;
        if (db) {
          for (const storeName of Object.values(STORES)) {
            try {
              const tx = db.transaction(storeName, 'readwrite');
              tx.objectStore(storeName).clear();
            } catch (e) {}
          }
          // Lưu lại default settings vào IndexedDB
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
}

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

export class BackupService {
  /**
   * Export all user data to a downloadable JSON file
   */
  static exportToJSON(filename = null) {
    try {
      const data = StorageManager.exportBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeFilename = filename || `flashcard_pro_backup_${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, count: Object.keys(data.cards || {}).length };
    } catch (e) {
      console.error('[BackupService] Export error:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Import data from a selected File or JSON text
   */
  static async importFromFile(file) {
    if (!file) {
      return { success: false, error: 'Không tìm thấy tệp dữ liệu để nhập.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const result = await StorageManager.importBackup(parsed);
          resolve(result);
        } catch (err) {
          resolve({ success: false, error: 'Tệp không đúng định dạng JSON hoặc bị lỗi cú pháp.' });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Không thể đọc tệp tin đã chọn.' });
      reader.readAsText(file);
    });
  }

  /**
   * Reset all progress and settings
   */
  static async resetAll() {
    return await StorageManager.clearAllData();
  }
}

