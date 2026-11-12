/**
 * IndexedDB Low-Level Driver & Legacy Card ID Migrator
 */

import { APP_CONFIG } from '../../config.js';

export const DB_NAME = APP_CONFIG.dbName || 'FlashcardProDB';
export const DB_VERSION = APP_CONFIG.dbVersion || 1;

export const STORES = {
  CARDS: 'cards',
  STUDY_LOGS: 'study_logs',
  SETTINGS: 'settings',
  CUSTOM_DECKS: 'custom_decks',
  STUDY_TIME: 'study_time',
  USER_PROGRESS: 'user_progress'
};

export function openIndexedDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
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
        } catch (err) {
          console.warn('[StorageManager] onupgradeneeded error:', err);
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

export function getAllFromStore(db, storeName) {
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

export function putToStore(db, storeName, item) {
  if (!db) return Promise.resolve(false);
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
      console.warn(`[StorageManager] Exception in putToStore:`, e);
      resolve(false);
    }
  });
}

/**
 * Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn sau khi deduplicate
 */
export function migrateLegacyCardStates(rawCards, cardsStorageKey, legacyIdMap) {
  if (!rawCards || typeof rawCards !== 'object') return {};
  if (!legacyIdMap || Object.keys(legacyIdMap).length === 0) return rawCards;

  let migrated = false;
  const cards = { ...rawCards };

  for (const [legacyId, canonicalId] of Object.entries(legacyIdMap)) {
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

  if (migrated && typeof localStorage !== 'undefined' && cardsStorageKey) {
    try {
      localStorage.setItem(cardsStorageKey, JSON.stringify(cards));
    } catch (e) {}
  }

  return cards;
}

