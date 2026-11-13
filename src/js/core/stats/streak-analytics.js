/**
 * Streak Analytics & Recovery Detector
 * Tính toán chuỗi ngày học liên tục (Auto-heal) và phát hiện chuỗi vừa đứt để cứu chuỗi.
 */

import { StorageManager } from "../../services/storage.js";
import { STREAK_COOLDOWN_DAYS } from "../../config.js";
import { getLocalDateKey } from "../../utils.js";

function buildStudiedDateSets(logs = null, explicitStreakState = null) {
  const streakState = explicitStreakState || StorageManager.getStreakState();
  const frozenSet = new Set(streakState?.frozenDates || []);
  const recoveredSet = new Set(streakState?.recoveredDates || []);
  const dateSet = new Set(streakState?.studiedDates || []);

  // 1. Nạp tất cả các ngày từ study_time (lưu trữ thời gian học vĩnh viễn theo ngày)
  const timeMap = StorageManager.getStudyTimeMap() || {};
  for (const [dateKey, seconds] of Object.entries(timeMap)) {
    if (Number(seconds) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      dateSet.add(dateKey);
    }
  }

  // 2. Nạp tất cả các ngày từ logs (hỗ trợ đa dạng thuộc tính thời gian)
  const studyLogs = logs || StorageManager.getStudyLogs() || [];
  for (let i = 0; i < studyLogs.length; i++) {
    const l = studyLogs[i];
    if (!l) continue;
    const ts = l.timestamp || l.review || l.review_time || l.date;
    if (ts) {
      const key = getLocalDateKey(ts);
      if (key && /^\d{4}-\d{2}-\d{2}$/.test(key)) dateSet.add(key);
    }
  }

  return { streakState, frozenSet, recoveredSet, dateSet };
}

/**
 * Tính toán chuỗi ngày học liên tục (Streak), tích hợp Khiên, Auto-heal & đồng bộ studiedDates.
 */
export function calculateStreak(logs = null, explicitStreakState = null) {
  const { streakState, frozenSet, recoveredSet, dateSet } = buildStudiedDateSets(
    logs,
    explicitStreakState,
  );

  if (dateSet.size === 0 && frozenSet.size === 0 && recoveredSet.size === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  let brokenAtDay = -1;

  for (let i = 0; i < 730; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getLocalDateKey(d);

    if (dateSet.has(key) || frozenSet.has(key) || recoveredSet.has(key)) {
      streak++;
    } else {
      if (i === 0) continue;
      brokenAtDay = i;
      break;
    }
  }

  // AUTO-HEAL: Khôi phục chuỗi nếu bị cụt rìa do LocalStorage cắt lát 500 logs gần nhất
  const longestStreak = Number(streakState?.longestStreak) || 0;
  if (longestStreak > streak && brokenAtDay > 0) {
    let earliestDate = null;
    for (const dStr of dateSet) {
      if (!earliestDate || dStr < earliestDate) earliestDate = dStr;
    }

    const brokenDateObj = new Date(today);
    brokenDateObj.setDate(today.getDate() - brokenAtDay);
    const brokenDateKey = getLocalDateKey(brokenDateObj);

    if (!earliestDate || brokenDateKey <= earliestDate) {
      const datesToBackfill = [];
      const hasStudiedToday = dateSet.has(getLocalDateKey(today));
      for (let k = streak; k < longestStreak; k++) {
        const backfillD = new Date(today);
        backfillD.setDate(today.getDate() - (k + (hasStudiedToday ? 0 : 1)));
        const bKey = getLocalDateKey(backfillD);
        dateSet.add(bKey);
        datesToBackfill.push(bKey);
      }
      streak = longestStreak;

      try {
        const curState = StorageManager.getStreakState();
        const curDates = new Set(curState.studiedDates || []);
        datesToBackfill.forEach((d) => curDates.add(d));
        curState.studiedDates = Array.from(curDates);
        StorageManager.saveStreakState(curState);
      } catch (e) {}
    }
  }

  // Đồng bộ ngược các ngày phát hiện được vào streakState.studiedDates
  if (dateSet.size > (streakState?.studiedDates?.length || 0)) {
    try {
      const curState = StorageManager.getStreakState();
      curState.studiedDates = Array.from(dateSet);
      StorageManager.saveStreakState(curState);
    } catch (e) {}
  }

  // Tự động kiểm tra thưởng khiên đóng băng và cập nhật kỷ lục
  if (
    streak > 0 &&
    typeof StorageManager.checkAndAwardStreakFreeze === "function"
  ) {
    try {
      StorageManager.checkAndAwardStreakFreeze(streak);
    } catch (e) {}
  }

  return streak;
}

/**
 * Phân tích chuỗi ngày học vừa đứt trong 24h - 48h gần nhất để phục vụ cứu chuỗi.
 */
export function detectBrokenStreak(logs = null, explicitStreakState = null) {
  const { streakState, frozenSet, recoveredSet, dateSet } = buildStudiedDateSets(
    logs,
    explicitStreakState,
  );

  if (dateSet.size === 0 && frozenSet.size === 0 && recoveredSet.size === 0) {
    return { isBroken: false, canRecover: false };
  }

  const isValidDate = (key) =>
    dateSet.has(key) || frozenSet.has(key) || recoveredSet.has(key);

  const today = new Date();
  const todayKey = getLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  if (isValidDate(yesterdayKey)) {
    return { isBroken: false, canRecover: false };
  }

  let pastStreakBeforeMiss = 0;
  for (let i = 2; i < 730; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (isValidDate(getLocalDateKey(d))) {
      pastStreakBeforeMiss++;
    } else {
      break;
    }
  }

  if (pastStreakBeforeMiss === 0) {
    return { isBroken: false, canRecover: false };
  }

  const studiedToday = dateSet.has(todayKey);
  const potentialRestoredStreak =
    pastStreakBeforeMiss + 1 + (studiedToday ? 1 : 0);

  const freezes = Number(streakState?.freezes || 0);
  const canUseFreeze = freezes > 0;

  const cooldownMs = (STREAK_COOLDOWN_DAYS || 14) * 86400000;
  const lastRecovery = Number(streakState?.lastRecoveryTimestamp || 0);
  const timeSinceLast = Date.now() - lastRecovery;
  const isCooldownActive = lastRecovery > 0 && timeSinceLast < cooldownMs;
  const cooldownDaysLeft = isCooldownActive
    ? Math.ceil((cooldownMs - timeSinceLast) / 86400000)
    : 0;

  return {
    isBroken: true,
    canRecover: true,
    missedDate: yesterdayKey,
    pastStreakBeforeMiss,
    potentialRestoredStreak,
    studiedToday,
    freezesAvailable: freezes,
    canUseFreeze,
    canRedeem: !isCooldownActive,
    cooldownDaysLeft,
  };
}
