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

  static async _putToStore(db, storeName, item) {
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => {
          console.warn(`[StorageManager] IndexedDB put error on ${storeName}:`, e);
          resolve(false);
        };
        tx.onabort = () => resolve(false);
      } catch (e) {
        console.warn(`[StorageManager] Exception in _putToStore:`, e);
        resolve(false);
      }
    });
  }

  static invalidateCache() {
    _cardsCache = null;
    _settingsCache = null;
    _logsCache = null;
    _timeMapCache = null;
    _customDecksCache = null;
    _userProgressCache = null;
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
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (lsErr) {
          console.warn('localStorage quota warning on saveSettings:', lsErr);
        }
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
      
      // Giới hạn history trong state để không làm phình to bộ nhớ
      const history = Array.isArray(cardState.history) ? cardState.history.slice(-10) : [];
      const normalizedState = { ...cardState, id: canonicalId, history };
      
      cards[canonicalId] = normalizedState;
      _cardsCache = cards;
      _stateRevision++;

      // 1. Lưu trữ IndexedDB bền vững (First-class persistence)
      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.CARDS, normalizedState);
        }).catch((idbErr) => {
          console.warn('[StorageManager] IndexedDB saveCardState error:', idbErr);
        });
      }

      // 2. Backup an toàn sang LocalStorage (với try/catch độc lập chống tràn quota)
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
        } catch (lsErr) {
          console.warn('[StorageManager] LocalStorage full or blocked, IndexedDB remains source of truth:', lsErr);
        }
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
        const history = Array.isArray(state.history) ? state.history.slice(-10) : [];
        const normalized = { ...state, id: canonicalId, history };
        cards[canonicalId] = normalized;
        normalizedMap[canonicalId] = normalized;
      }
      _cardsCache = cards;
      _stateRevision++;

      if (_dbPromise) {
        _dbPromise.then(db => {
          if (!db) return;
          const tx = db.transaction(STORES.CARDS, 'readwrite');
          const store = tx.objectStore(STORES.CARDS);
          for (const card of Object.values(normalizedMap)) {
            store.put(card);
          }
        }).catch(() => {});
      }

      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
        } catch (lsErr) {
          console.warn('[StorageManager] LocalStorage quota error on batch save:', lsErr);
        }
      }
    } catch (e) {
      console.error('Error saving batch cards:', e);
    }
  }

  /**
   * Tạm dừng thẻ (Suspend) - ẩn khỏi hàng đợi ôn tập
   */
  static suspendCard(cardId) {
    if (!cardId) return null;
    let state = this.getCardState(cardId);
    if (!state) {
      state = {
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
        suspended: true,
        isLeech: false,
        history: []
      };
    } else {
      state = { ...state, suspended: true };
    }
    this.saveCardState(state);
    return state;
  }

  /**
   * Bỏ tạm dừng thẻ (Unsuspend)
   */
  static unsuspendCard(cardId) {
    if (!cardId) return null;
    let state = this.getCardState(cardId);
    if (!state) return null;
    state = { ...state, suspended: false };
    this.saveCardState(state);
    return state;
  }

  /**
   * Đảo trạng thái tạm dừng của thẻ
   */
  static toggleCardSuspended(cardId) {
    if (!cardId) return false;
    const state = this.getCardState(cardId);
    if (state && state.suspended) {
      this.unsuspendCard(cardId);
      return false;
    } else {
      this.suspendCard(cardId);
      return true;
    }
  }

  /**
   * Đặt lại tiến độ thẻ về từ mới hoàn toàn (Reset / Forget)
   */
  static resetCardProgress(cardId) {
    if (!cardId) return null;
    const emptyState = {
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
      history: []
    };
    this.saveCardState(emptyState);
    return emptyState;
  }

  /**
   * Kiểm tra xem thẻ có đang bị tạm dừng hay không
   */
  static isCardSuspended(cardId) {
    if (!cardId) return false;
    const state = this.getCardState(cardId);
    return Boolean(state && state.suspended === true);
  }

  static logReview(reviewEvent) {
    try {
      const logs = this.getStudyLogs();
      const logEntry = {
        id: reviewEvent.id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        ...reviewEvent,
        timestamp: reviewEvent.timestamp || new Date().toISOString()
      };
      logs.push(logEntry);

      if (logs.length > 5000) logs.splice(0, logs.length - 5000);
      _logsCache = logs;

      if (_dbPromise) {
        _dbPromise.then(db => {
          this._putToStore(db, STORES.STUDY_LOGS, logEntry);
        }).catch(() => {});
      }

      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs.slice(-500)));
        } catch (lsErr) {
          console.warn('LocalStorage quota warning on logReview:', lsErr);
        }
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
    return this.exportCompactBackup();
  }

  /**
   * Xuất bản sao lưu Nano FSRS siêu nhẹ (giảm 85-95% dung lượng, giữ 100% dữ liệu)
   */
  static exportCompactBackup() {
    const allCardStates = this.getAllCardStates() || {};
    const compactCards = [];

    for (const [id, s] of Object.entries(allCardStates)) {
      if (!s) continue;
      const stateNum = s.state ?? 0;
      const reps = s.reps ?? 0;
      const lapses = s.lapses ?? 0;
      const stability = Number((s.stability || 0).toFixed(2));
      const difficulty = Number((s.difficulty || 5).toFixed(2));
      const isLeech = s.isLeech === true || (s.lapses && s.lapses >= 6);
      const isSuspended = s.suspended === true;

      // Chỉ lưu thẻ người học đã tương tác hoặc có trạng thái cá nhân hóa
      if (stateNum !== 0 || reps > 0 || lapses > 0 || stability > 0 || isLeech || isSuspended) {
        const dueSec = s.due ? Math.floor(new Date(s.due).getTime() / 1000) : 0;
        const lastReviewSec = s.last_review ? Math.floor(new Date(s.last_review).getTime() / 1000) : 0;
        const flags = (isLeech ? 1 : 0) | (isSuspended ? 2 : 0);

        compactCards.push([
          id,
          stateNum,
          reps,
          lapses,
          stability,
          difficulty,
          dueSec,
          lastReviewSec,
          flags
        ]);
      }
    }

    const logs = this.getStudyLogs() || [];
    const compactLogs = logs.map(l => {
      const tsSec = l.timestamp ? Math.floor(new Date(l.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000);
      return [
        l.cardId || l.word || '',
        l.rating || 3,
        tsSec,
        typeof l.latencySec === 'number' ? Number(l.latencySec.toFixed(2)) : 0,
        typeof l.backViewSec === 'number' ? Number(l.backViewSec.toFixed(2)) : 0
      ];
    });

    return {
      v: '3.0',
      type: 'fc_fsrs_nano',
      t: Math.floor(Date.now() / 1000),
      s: this.getSettings(),
      c: compactCards,
      l: compactLogs,
      d: this.getCustomDecks(),
      st: this.getStudyTimeMap(),
      up: this.getUserProgress()
    };
  }

  static _normalizeCardState(raw) {
    if (!raw) return null;
    
    // 1. Hỗ trợ định dạng Compact Positional Tuple: [id, state, reps, lapses, stability, difficulty, dueSec, lastReviewSec, flags]
    if (Array.isArray(raw)) {
      const [id, state, reps, lapses, stability, difficulty, dueSec, lastReviewSec, flags] = raw;
      if (!id) return null;
      const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[id]) || id;
      const flagNum = flags || 0;

      return {
        id: canonicalId,
        state: typeof state === 'number' ? state : 0,
        reps: typeof reps === 'number' ? reps : 0,
        lapses: typeof lapses === 'number' ? lapses : 0,
        stability: typeof stability === 'number' ? stability : 0,
        difficulty: typeof difficulty === 'number' ? difficulty : 5,
        due: dueSec > 0 ? new Date(dueSec * 1000).toISOString() : null,
        last_review: lastReviewSec > 0 ? new Date(lastReviewSec * 1000).toISOString() : null,
        isLeech: (flagNum & 1) === 1,
        suspended: (flagNum & 2) === 2,
        elapsed_days: 0,
        scheduled_days: 0
      };
    }

    if (typeof raw !== 'object') return null;

    // 2. Hỗ trợ định dạng Object (Legacy 2.0 & 1.0)
    let due = raw.due || raw.du || null;
    if (due && typeof due === 'number') {
      due = new Date(due > 1e11 ? due : due * 1000).toISOString();
    }
    let lastReview = raw.last_review || raw.lr || null;
    if (lastReview && typeof lastReview === 'number') {
      lastReview = new Date(lastReview > 1e11 ? lastReview : lastReview * 1000).toISOString();
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
      difficulty: raw.difficulty ?? raw.d ?? 5,
      due: due,
      last_review: lastReview,
      isLeech: Boolean(raw.isLeech === true || (raw.lapses && raw.lapses >= 6)),
      suspended: Boolean(raw.suspended === true),
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

      // 1. Chuẩn hóa danh sách thẻ cards (Hỗ trợ cả Compact Tuple Array, Object {} và Legacy Array [])
      const rawCards = data.cards || data.c || {};
      const normalizedCards = {};
      if (Array.isArray(rawCards)) {
        rawCards.forEach(c => {
          if (c) {
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

      // 3. Lịch sử ôn tập (Logs) - Tự động Deduplicate & Chuyển đổi Tuple
      const rawLogs = data.logs || data.l || data.study_logs;
      if (Array.isArray(rawLogs)) {
        const existingLogs = this.getStudyLogs() || [];
        const logMap = new Map();

        const normalizeLog = (l) => {
          if (!l) return null;
          if (Array.isArray(l)) {
            const [cardId, rating, tsSec, latencySec, backViewSec] = l;
            return {
              id: `log_${tsSec}_${cardId}`,
              cardId: cardId,
              rating: rating || 3,
              timestamp: tsSec > 0 ? new Date(tsSec * 1000).toISOString() : new Date().toISOString(),
              latencySec: latencySec || null,
              backViewSec: backViewSec || null
            };
          }
          return l;
        };

        [...existingLogs, ...rawLogs].forEach(item => {
          const l = normalizeLog(item);
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
      const rawCustom = data.customDecks || data.d || data.custom_decks;
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
      const rawTime = data.studyTime || data.st || data.study_time;
      if (rawTime && typeof rawTime === 'object') {
        _timeMapCache = { ...(this.getStudyTimeMap() || {}), ...rawTime };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.STUDY_TIME, JSON.stringify(_timeMapCache));
        }
      }

      // 6. Tiến độ người dùng & Ghim chủ đề (User Progress & Pinned Topics)
      const rawProgress = data.userProgress || data.up || data.user_progress;
      if (rawProgress && typeof rawProgress === 'object') {
        const curProgress = this.getUserProgress() || { completedSubtopics: [], pinnedTopics: [] };
        const incCompleted = Array.isArray(rawProgress.completedSubtopics) ? rawProgress.completedSubtopics : [];
        const incPinned = Array.isArray(rawProgress.pinnedTopics) ? rawProgress.pinnedTopics : [];
        
        const mergedCompleted = Array.from(new Set([
          ...(Array.isArray(curProgress.completedSubtopics) ? curProgress.completedSubtopics : []),
          ...incCompleted
        ]));
        
        const mergedPinned = Array.from(new Set([
          ...(Array.isArray(curProgress.pinnedTopics) ? curProgress.pinnedTopics : []),
          ...incPinned
        ]));

        _userProgressCache = {
          id: 'global_progress',
          completedSubtopics: mergedCompleted,
          pinnedTopics: mergedPinned
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(_userProgressCache));
        }
      }

      // 7. Ghi đè đồng bộ vào IndexedDB bền vững
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

          if (_userProgressCache) {
            try {
              this._putToStore(db, STORES.USER_PROGRESS, _userProgressCache);
            } catch (e) {}
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
      _userProgressCache = { id: 'global_progress', completedSubtopics: [], pinnedTopics: [] };
      _settingsCache = { ...DEFAULT_SETTINGS };

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.CARDS);
        localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_DECKS);
        localStorage.removeItem(STORAGE_KEYS.STUDY_TIME);
        localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
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
   * Xuất toàn bộ dữ liệu người dùng ra tệp sao lưu Nano JSON siêu nhẹ (.json)
   */
  static exportToJSON(customFilename = null) {
    try {
      const data = StorageManager.exportBackup();
      // Xuất JSON compact (không thụt lề khoảng trắng dư thừa) để tối ưu dung lượng siêu nhẹ
      const jsonStr = JSON.stringify(data);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const timeTag = `${yyyy}${mm}${dd}_${hh}h${min}`;
      
      const safeFilename = customFilename || `flashcard_backup_${timeTag}.json`;
      const sizeKb = Number((blob.size / 1024).toFixed(1));
      const cardCount = Array.isArray(data.c) ? data.c.length : Object.keys(data.cards || {}).length;

      const link = document.createElement('a');
      link.href = url;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        count: cardCount,
        sizeKb: sizeKb,
        filename: safeFilename
      };
    } catch (e) {
      console.error('[BackupService] Lỗi xuất file sao lưu:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Nhập dữ liệu từ tệp File hoặc văn bản JSON đã sao lưu (hỗ trợ cả chuẩn Nano Tuple và Legacy JSON)
   */
  static async importFromFile(file) {
    if (!file) {
      return { success: false, error: 'Không tìm thấy tệp dữ liệu để nhập.' };
    }

    try {
      let text = '';
      // Hỗ trợ giải nén nếu là file nén GZIP / DecompressionStream (.gz, .fcpro)
      if (file.name && (file.name.endsWith('.gz') || file.name.endsWith('.fcpro')) && typeof DecompressionStream !== 'undefined') {
        try {
          const ds = new DecompressionStream('gzip');
          const decompressedStream = file.stream().pipeThrough(ds);
          const response = new Response(decompressedStream);
          text = await response.text();
        } catch (decompErr) {
          text = await file.text();
        }
      } else {
        text = await file.text();
      }

      const parsed = JSON.parse(text);
      return await StorageManager.importBackup(parsed);
    } catch (err) {
      console.error('[BackupService] Lỗi đọc tệp sao lưu:', err);
      return { success: false, error: 'Tệp không đúng định dạng JSON hoặc bị lỗi cú pháp: ' + err.message };
    }
  }

  /**
   * Đặt lại toàn bộ dữ liệu và tiến trình học về trạng thái ban đầu
   */
  static async resetAll() {
    return await StorageManager.clearAllData();
  }
}

