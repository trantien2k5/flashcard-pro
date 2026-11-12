/**
 * Settings, Study Logs, Study Time & Streak Storage Domain
 */

import { getLocalDateKey } from '../../utils.js';
import { DEFAULT_SETTINGS, DEFAULT_STREAK_STATE } from '../../config.js';
import { STORES } from './idb.js';
import { applyStreakFreeze, applyStreakRedeem, evaluateStreakReward } from './streak.js';
import {
  STORAGE_KEYS,
  storageCache,
  putToIdb,
  bumpStateRevision,
  scheduleLogsLocalStorageSync,
  scheduleTimeLocalStorageSync
} from './state.js';

export function getSettings() {
  if (storageCache.settings !== null) return storageCache.settings;
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    storageCache.settings = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    return storageCache.settings;
  } catch (e) {
    console.error('Error reading settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    storageCache.settings = { ...settings };
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (lsErr) {
        console.warn('localStorage quota warning on saveSettings:', lsErr);
      }
    }
    putToIdb(STORES.SETTINGS, { key: 'user_settings', ...settings });
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getStreakState() {
  if (storageCache.streakState !== null) {
    if (!Array.isArray(storageCache.streakState.studiedDates)) storageCache.streakState.studiedDates = [];
    return storageCache.streakState;
  }
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_STREAK_STATE, studiedDates: [] };
    const data = localStorage.getItem(STORAGE_KEYS.STREAK_STATE);
    storageCache.streakState = data ? { ...DEFAULT_STREAK_STATE, ...JSON.parse(data) } : { ...DEFAULT_STREAK_STATE };
    if (!Array.isArray(storageCache.streakState.studiedDates)) storageCache.streakState.studiedDates = [];
    return storageCache.streakState;
  } catch (e) {
    console.error('Error reading streak state:', e);
    return { ...DEFAULT_STREAK_STATE, studiedDates: [] };
  }
}

export function saveStreakState(state) {
  if (!state || typeof state !== 'object') return;
  try {
    storageCache.streakState = { ...state };
    if (!Array.isArray(storageCache.streakState.studiedDates)) storageCache.streakState.studiedDates = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STREAK_STATE, JSON.stringify(storageCache.streakState));
    }
    putToIdb(STORES.SETTINGS, { key: 'streak_state', ...storageCache.streakState });
  } catch (e) {
    console.error('Error saving streak state:', e);
  }
}

export function useStreakFreeze(dateKey) {
  const { success, state } = applyStreakFreeze(getStreakState(), dateKey);
  if (!success) return false;
  saveStreakState(state);
  bumpStateRevision();
  return true;
}

export function redeemStreak(dateKey) {
  const { success, state } = applyStreakRedeem(getStreakState(), dateKey);
  if (!success) return false;
  saveStreakState(state);
  bumpStateRevision();
  return true;
}

export function checkAndAwardStreakFreeze(currentStreak) {
  const res = evaluateStreakReward(getStreakState(), currentStreak);
  if (res.state) {
    saveStreakState(res.state);
  }
  return {
    awarded: res.awarded,
    freezes: res.freezes,
    milestone: res.milestone || (getStreakState()?.lastAwardedMilestone || 0)
  };
}

export function getStudyLogs() {
  if (storageCache.logs !== null) return storageCache.logs;
  try {
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
    storageCache.logs = data ? JSON.parse(data) : [];
    return storageCache.logs;
  } catch (e) {
    console.error('Error reading logs:', e);
    return [];
  }
}

export function getStudyTimeMap() {
  if (storageCache.timeMap !== null) return storageCache.timeMap;
  try {
    if (typeof localStorage === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.STUDY_TIME);
    storageCache.timeMap = data ? JSON.parse(data) : {};
    return storageCache.timeMap;
  } catch (e) {
    console.error('Error reading study time:', e);
    return {};
  }
}

/**
 * Ghi nhận ngày học hợp lệ vào hệ thống (lưu trữ vĩnh viễn không bị cắt 500 logs)
 * Đồng bộ đồng thời vào streakState.studiedDates và studyTimeMap
 */
export function recordStudiedDate(dateKey = null) {
  const key = dateKey || getLocalDateKey();
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
  try {
    const streak = getStreakState();
    const dates = Array.isArray(streak.studiedDates) ? streak.studiedDates : [];
    if (!dates.includes(key)) {
      dates.push(key);
      streak.studiedDates = dates;
      saveStreakState(streak);
    }
    const timeMap = getStudyTimeMap();
    if (!timeMap[key] || timeMap[key] <= 0) {
      timeMap[key] = 1;
      storageCache.timeMap = timeMap;
      scheduleTimeLocalStorageSync();
    }
  } catch (e) {
    console.warn('Lỗi recordStudiedDate:', e);
  }
}

export function logReview(reviewEvent) {
  try {
    const reviewDate = reviewEvent.timestamp ? getLocalDateKey(reviewEvent.timestamp) : getLocalDateKey();
    recordStudiedDate(reviewDate);

    const logs = getStudyLogs();
    const logEntry = {
      id: reviewEvent.id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...reviewEvent,
      timestamp: reviewEvent.timestamp || new Date().toISOString()
    };
    logs.push(logEntry);

    if (logs.length > 5000) logs.splice(0, logs.length - 5000);
    storageCache.logs = logs;

    putToIdb(STORES.STUDY_LOGS, logEntry);
    scheduleLogsLocalStorageSync();
  } catch (e) {
    console.error('Error logging review:', e);
  }
}

export function getTodayStudySeconds() {
  const timeMap = getStudyTimeMap();
  const todayKey = getLocalDateKey();
  return timeMap[todayKey] || 0;
}

export function getTotalStudySeconds() {
  try {
    const timeMap = getStudyTimeMap();
    return Object.values(timeMap).reduce((sum, sec) => sum + (Number(sec) || 0), 0);
  } catch (e) {
    return 0;
  }
}

export function addStudySeconds(seconds) {
  if (!seconds || seconds <= 0) return 0;
  try {
    const todayKey = getLocalDateKey();
    recordStudiedDate(todayKey);

    const timeMap = getStudyTimeMap();
    const current = timeMap[todayKey] || 0;
    const updated = current + Math.round(seconds);
    timeMap[todayKey] = updated;
    storageCache.timeMap = timeMap;

    putToIdb(STORES.STUDY_TIME, { date: todayKey, seconds: updated });
    scheduleTimeLocalStorageSync();
    return updated;
  } catch (e) {
    console.error('Error saving study time:', e);
    return 0;
  }
}

