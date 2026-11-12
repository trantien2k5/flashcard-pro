/**
 * Shared Storage State, Cache & Debounced LocalStorage Sync
 * Quản lý tập trung bộ nhớ đệm RAM (Write-Through Cache) và đồng bộ trì hoãn vào LocalStorage.
 */

import { LEGACY_ID_MAP } from '../../../data/index.js';
import {
  STORES,
  putToStore,
  migrateLegacyCardStates as migrateLegacyCards
} from './idb.js';

export const STORAGE_KEYS = {
  CARDS: 'fsrs_card_states_v1',
  SETTINGS: 'fsrs_user_settings_v1',
  CUSTOM_DECKS: 'fsrs_custom_decks_v1',
  STUDY_LOGS: 'fsrs_study_logs_v1',
  STUDY_TIME: 'fsrs_study_time_v1',
  USER_PROGRESS: 'fsrs_user_progress_v1',
  STREAK_STATE: 'fsrs_streak_state_v1',
  SAFETY_SNAPSHOT: 'fsrs_safety_snapshot_v1',
  TOEIC_TESTS: 'fsrs_toeic_tests_v1'
};

export const storageCache = {
  cards: null,
  settings: null,
  streakState: null,
  logs: null,
  timeMap: null,
  customDecks: null,
  userProgress: null,
  dbPromise: null,
  stateRevision: 1
};

let _debouncedCardsTimer = null;
let _debouncedLogsTimer = null;
let _debouncedTimeTimer = null;

// Map ngược để tra cứu 2 chiều Canonical ID ⇋ Legacy ID
export const REVERSE_ID_MAP = {};
if (typeof LEGACY_ID_MAP === 'object' && LEGACY_ID_MAP !== null) {
  for (const [legId, canId] of Object.entries(LEGACY_ID_MAP)) {
    REVERSE_ID_MAP[canId] = legId;
  }
}

/**
 * Trả về phiên bản revision hiện tại của trạng thái lưu trữ
 */
export function getStateRevision() {
  return storageCache.stateRevision;
}

/**
 * Tăng bộ đếm revision sau khi trạng thái thay đổi đáng kể
 */
export function bumpStateRevision() {
  storageCache.stateRevision++;
}

/**
 * Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn
 */
export function migrateLegacyCardStates(rawCards) {
  return migrateLegacyCards(rawCards, STORAGE_KEYS.CARDS, LEGACY_ID_MAP);
}

/**
 * Đặt lại toàn bộ bộ nhớ đệm RAM (buộc đọc lại từ nguồn lưu trữ)
 */
export function invalidateCache() {
  storageCache.cards = null;
  storageCache.settings = null;
  storageCache.streakState = null;
  storageCache.logs = null;
  storageCache.timeMap = null;
  storageCache.customDecks = null;
  storageCache.userProgress = null;
}

/**
 * Hủy các bộ hẹn giờ đồng bộ LocalStorage đang chờ
 */
export function clearPendingSyncTimers() {
  if (_debouncedCardsTimer) { clearTimeout(_debouncedCardsTimer); _debouncedCardsTimer = null; }
  if (_debouncedLogsTimer) { clearTimeout(_debouncedLogsTimer); _debouncedLogsTimer = null; }
  if (_debouncedTimeTimer) { clearTimeout(_debouncedTimeTimer); _debouncedTimeTimer = null; }
}

/**
 * Ghi ngầm một bản ghi vào IndexedDB Store không chặn luồng giao diện
 */
export function putToIdb(storeName, item, warnLabel = null) {
  if (!storageCache.dbPromise) return;
  storageCache.dbPromise.then(db => {
    return putToStore(db, storeName, item);
  }).catch((idbErr) => {
    if (warnLabel) {
      console.warn(warnLabel, idbErr);
    }
  });
}

function writeCacheToLocalStorage(storageKey, value, warnLabel = null) {
  if (typeof localStorage === 'undefined' || value === null || value === undefined) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (lsErr) {
    if (warnLabel) {
      console.warn(warnLabel, lsErr);
    }
  }
}

export function scheduleCardsLocalStorageSync() {
  if (typeof localStorage === 'undefined') return;
  if (_debouncedCardsTimer) clearTimeout(_debouncedCardsTimer);
  _debouncedCardsTimer = setTimeout(() => {
    _debouncedCardsTimer = null;
    writeCacheToLocalStorage(STORAGE_KEYS.CARDS, storageCache.cards, '[StorageManager] LocalStorage full or blocked:');
  }, 600);
}

export function scheduleLogsLocalStorageSync() {
  if (typeof localStorage === 'undefined') return;
  if (_debouncedLogsTimer) clearTimeout(_debouncedLogsTimer);
  _debouncedLogsTimer = setTimeout(() => {
    _debouncedLogsTimer = null;
    const logsSlice = storageCache.logs ? storageCache.logs.slice(-500) : null;
    writeCacheToLocalStorage(STORAGE_KEYS.STUDY_LOGS, logsSlice, '[StorageManager] LocalStorage log quota warning:');
  }, 800);
}

export function scheduleTimeLocalStorageSync() {
  if (typeof localStorage === 'undefined') return;
  if (_debouncedTimeTimer) clearTimeout(_debouncedTimeTimer);
  _debouncedTimeTimer = setTimeout(() => {
    _debouncedTimeTimer = null;
    writeCacheToLocalStorage(STORAGE_KEYS.STUDY_TIME, storageCache.timeMap);
  }, 1000);
}

/**
 * Đẩy ngay mọi dữ liệu đang chờ debounce vào LocalStorage (khi đóng trang)
 */
export function flushPendingSync() {
  if (typeof localStorage === 'undefined') return;
  try {
    if (_debouncedCardsTimer && storageCache.cards) {
      clearTimeout(_debouncedCardsTimer);
      _debouncedCardsTimer = null;
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(storageCache.cards));
    }
    if (_debouncedLogsTimer && storageCache.logs) {
      clearTimeout(_debouncedLogsTimer);
      _debouncedLogsTimer = null;
      localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(storageCache.logs.slice(-500)));
    }
    if (_debouncedTimeTimer && storageCache.timeMap) {
      clearTimeout(_debouncedTimeTimer);
      _debouncedTimeTimer = null;
      localStorage.setItem(STORAGE_KEYS.STUDY_TIME, JSON.stringify(storageCache.timeMap));
    }
  } catch (e) {}
}

