/**
 * Storage Service Facade (SSOT Public API)
 * Điều phối bộ nhớ đệm RAM (Write-Through Cache), IndexedDB, LocalStorage & Backup/Restore.
 */

import { DEFAULT_SETTINGS } from '../config.js';
import { triggerJSONDownload, readBackupFileText } from './storage/backup.js';
import {
  getStateRevision,
  bumpStateRevision,
  invalidateCache,
  flushPendingSync
} from './storage/state.js';
import {
  getSettings,
  saveSettings,
  getStreakState,
  saveStreakState,
  useStreakFreeze,
  redeemStreak,
  checkAndAwardStreakFreeze,
  recordStudiedDate,
  logReview,
  getStudyLogs,
  getStudyTimeMap,
  getTodayStudySeconds,
  getTotalStudySeconds,
  addStudySeconds
} from './storage/logs.js';
import {
  getAllCardStates,
  getCardState,
  applyCardReview,
  saveCardState,
  saveMultipleCardStates,
  suspendCard,
  unsuspendCard,
  resetLeechStatus,
  toggleCardSuspended,
  resetCardProgress,
  isCardSuspended
} from './storage/cards.js';
import {
  saveToeicTestResult,
  getToeicTestHistory,
  getUserProgress,
  saveUserProgress,
  completeSubtopic,
  isSubtopicCompleted,
  getPinnedTopicIds,
  isTopicPinned,
  togglePinTopic,
  getCustomDecks,
  saveCustomDeck,
  deleteCustomDeck,
  getUserProfile,
  saveUserProfile,
  getUserPreferences,
  saveUserPreferences
} from './storage/user-data.js';
import { initStorage } from './storage/preload.js';
import {
  exportCompactBackup,
  importBackup,
  createSafetySnapshot,
  restoreSafetySnapshot,
  clearAllData
} from './storage/sync.js';

export { DEFAULT_SETTINGS };

export class StorageManager {
  static getStateRevision() { return getStateRevision(); }
  static bumpStateRevision() { bumpStateRevision(); }

  static async initStorage() { return initStorage(); }
  static invalidateCache() { invalidateCache(); }
  static flushPendingSync() { flushPendingSync(); }

  static getSettings() { return getSettings(); }
  static saveSettings(settings) { saveSettings(settings); }

  static getAllCardStates() { return getAllCardStates(); }
  static getCardState(cardId) { return getCardState(cardId); }
  static applyCardReview(params) { return applyCardReview(params); }
  static saveCardState(cardState) { saveCardState(cardState); }
  static saveMultipleCardStates(cardStatesMap) { saveMultipleCardStates(cardStatesMap); }
  static suspendCard(cardId) { return suspendCard(cardId); }
  static unsuspendCard(cardId) { return unsuspendCard(cardId); }
  static resetLeechStatus(cardId) { return resetLeechStatus(cardId); }
  static toggleCardSuspended(cardId) { return toggleCardSuspended(cardId); }
  static resetCardProgress(cardId) { return resetCardProgress(cardId); }
  static isCardSuspended(cardId) { return isCardSuspended(cardId); }

  static recordStudiedDate(dateKey = null) { recordStudiedDate(dateKey); }
  static logReview(reviewEvent) { logReview(reviewEvent); }
  static getStudyLogs() { return getStudyLogs(); }
  static getStudyTimeMap() { return getStudyTimeMap(); }
  static getTodayStudySeconds() { return getTodayStudySeconds(); }
  static getTotalStudySeconds() { return getTotalStudySeconds(); }
  static addStudySeconds(seconds) { return addStudySeconds(seconds); }

  static saveToeicTestResult(testResult) { return saveToeicTestResult(testResult); }
  static getToeicTestHistory() { return getToeicTestHistory(); }

  static getUserProgress() { return getUserProgress(); }
  static saveUserProgress(progress) { saveUserProgress(progress); }
  static completeSubtopic(subtopicId) { completeSubtopic(subtopicId); }
  static isSubtopicCompleted(subtopicId) { return isSubtopicCompleted(subtopicId); }

  static getPinnedTopicIds() { return getPinnedTopicIds(); }
  static isTopicPinned(topicId) { return isTopicPinned(topicId); }
  static togglePinTopic(topicId) { return togglePinTopic(topicId); }

  static getStreakState() { return getStreakState(); }
  static saveStreakState(state) { saveStreakState(state); }
  static useStreakFreeze(dateKey) { return useStreakFreeze(dateKey); }
  static redeemStreak(dateKey) { return redeemStreak(dateKey); }
  static checkAndAwardStreakFreeze(currentStreak) { return checkAndAwardStreakFreeze(currentStreak); }

  static getCustomDecks() { return getCustomDecks(); }
  static saveCustomDeck(deck) { saveCustomDeck(deck); }
  static deleteCustomDeck(deckId) { deleteCustomDeck(deckId); }

  static createSafetySnapshot() { return createSafetySnapshot(); }
  static async restoreSafetySnapshot() { return restoreSafetySnapshot(); }

  static getUserProfile() { return getUserProfile(); }
  static saveUserProfile(profile) { saveUserProfile(profile); }
  static getUserPreferences() { return getUserPreferences(); }
  static saveUserPreferences(prefs) { saveUserPreferences(prefs); }

  static exportBackup() { return exportCompactBackup(); }
  static exportCompactBackup() { return exportCompactBackup(); }
  static async importBackup(backupData) { return importBackup(backupData); }
  static async clearAllData() { return clearAllData(); }
}

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

export class BackupService {
  /**
   * Xuất toàn bộ dữ liệu người dùng ra tệp sao lưu Nano JSON siêu nhẹ (.json)
   */
  static exportToJSON(customFilename = null) {
    const data = StorageManager.exportBackup();
    return triggerJSONDownload(data, customFilename);
  }

  /**
   * Nhập dữ liệu từ tệp File hoặc văn bản JSON đã sao lưu
   */
  static async importFromFile(file) {
    if (!file) {
      return { success: false, error: 'Không tìm thấy tệp dữ liệu để nhập.' };
    }

    try {
      const text = await readBackupFileText(file);
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

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try { StorageManager.flushPendingSync(); } catch (e) {}
  });
  window.addEventListener('pagehide', () => {
    try { StorageManager.flushPendingSync(); } catch (e) {}
  });
}
