/**
 * Stats Submodule: Study Journal, Calendar Heatmap, Weekly Progress & 7-Day Forecast
 */

import { StorageManager } from '../../services/storage.js';
import { State, Rating } from '../fsrs.js';
import { getLocalDateKey } from '../../utils.js';

export function getPrimeStudyHour(logs = []) {
  if (!logs || logs.length === 0) return null;

  const hourlyStats = Array.from({ length: 24 }, () => ({ total: 0, correct: 0 }));

  logs.forEach(l => {
    if (!l.timestamp) return;
    const d = new Date(l.timestamp);
    if (isNaN(d.getTime())) return;
    const hour = d.getHours();
    hourlyStats[hour].total++;
    if (l.rating && (l.rating === Rating.Good || l.rating === Rating.Easy)) {
      hourlyStats[hour].correct++;
    }
  });

  let bestHour = -1;
  let maxReviews = 0;

  for (let h = 0; h < 24; h++) {
    if (hourlyStats[h].total >= 3 && hourlyStats[h].total > maxReviews) {
      maxReviews = hourlyStats[h].total;
      bestHour = h;
    }
  }

  if (bestHour === -1) {
    for (let h = 0; h < 24; h++) {
      if (hourlyStats[h].total > maxReviews) {
        maxReviews = hourlyStats[h].total;
        bestHour = h;
      }
    }
  }

  if (bestHour === -1) return null;

  const startStr = `${String(bestHour).padStart(2, '0')}:00`;
  const endStr = `${String((bestHour + 2) % 24).padStart(2, '0')}:00`;
  const periodName = bestHour < 12 ? 'Sáng' : (bestHour < 18 ? 'Chiều' : 'Tối');

  return {
    hour: bestHour,
    timeRange: `${startStr} - ${endStr}`,
    period: periodName,
    reviews: maxReviews,
    text: `${startStr} - ${endStr} (${periodName})`
  };
}

/**
 * Lấy số từ ghi nhớ được / tích lũy theo từng ngày trong 7 ngày qua
 */
export function getWeeklyProgress(logs) {
  const result = [];
  const today = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Map ngày -> Set of cardIds ghi nhớ thành công
  const dateCardMap = Object.create(null);
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (!log.timestamp) continue;
    if (log.rating === Rating.Good || log.rating === Rating.Easy || log.rating === Rating.Hard) {
      const key = getLocalDateKey(log.timestamp);
      if (!dateCardMap[key]) {
        dateCardMap[key] = new Set();
      }
      dateCardMap[key].add(log.cardId || log.word);
    }
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = getLocalDateKey(d);

    const memorizedCount = dateCardMap[dateKey] ? dateCardMap[dateKey].size : 0;

    result.push({
      dayName: dayNames[d.getDay()],
      date: dateKey,
      count: memorizedCount,
      isToday: i === 0
    });
  }

  return result;
}

/**
 * Dự báo số thẻ đến hạn trong 7 ngày tới
 */
export function get7DaysForecast(cardStates) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfTodayMs = today.getTime();
  const oneDayMs = 86400000;
  const sevenDaysMs = 7 * oneDayMs;

  for (const cardId in cardStates) {
    const card = cardStates[cardId];
    if (card && card.due && card.state !== State.New && card.state !== 0) {
      const dueMs = new Date(card.due).getTime();
      const diffMs = dueMs - startOfTodayMs;
      if (diffMs < 0) {
        counts[0]++;
      } else if (diffMs < sevenDaysMs) {
        const dayIndex = Math.floor(diffMs / oneDayMs);
        if (dayIndex >= 0 && dayIndex < 7) {
          counts[dayIndex]++;
        }
      }
    }
  }

  const forecast = [];
  for (let i = 0; i < 7; i++) {
    forecast.push({
      dayOffset: i,
      label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `+${i} ngày`,
      count: counts[i]
    });
  }

  return forecast;
}

/**
 * Lấy dữ liệu nhật ký ô vuông theo tháng phong cách Trader (P&L Calendar)
 * @param {number} year - Năm (vd: 2026)
 * @param {number} month - Tháng (1-12)
 */
export function getMonthJournalData(year, month) {
  const logs = StorageManager.getStudyLogs() || [];
  
  // Ngày đầu tiên và số ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate();
  // getDay(): 0=CN, 1=T2, ..., 6=T7. Chuyển sang chuẩn T2=0, ..., CN=6
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const currentDay = today.getDate();

  // Map ngày (YYYY-MM-DD) -> thống kê
  const cardStates = StorageManager.getAllCardStates() || {};
  const dailyMap = Object.create(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyMap[dateKey] = {
      dateKey,
      day: d,
      wordsLearned: new Set(),
      wordsReviewed: new Set(),
      memorizedWords: new Set(),
      masteredWords: new Set(),
      goodReviews: 0,
      totalReviews: 0,
      studySeconds: 0,
      isToday: isCurrentMonth && d === currentDay,
      isFuture: isCurrentMonth ? d > currentDay : (new Date(year, month - 1, d) > today)
    };
  }

  // Nạp thời gian học theo ngày
  try {
    const timeLogs = StorageManager.getStudyTimeMap() || {};
    for (const dateKey in timeLogs) {
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].studySeconds = timeLogs[dateKey] || 0;
      }
    }
  } catch (e) {}

  // Quét studyLogs
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    const key = getLocalDateKey(log.timestamp);
    if (dailyMap[key]) {
      const item = dailyMap[key];
      item.totalReviews++;
      const cardId = log.cardId || log.word;
      if (cardId) {
        const isNew = log.oldState === State.New || log.oldState === 0 || (log.oldState === undefined && (log.state === State.New || log.state === 0 || log.isNew));
        if (isNew) {
          item.wordsLearned.add(cardId);
        } else {
          item.wordsReviewed.add(cardId);
        }
        if (log.rating === Rating.Good || log.rating === Rating.Easy) {
          item.memorizedWords.add(cardId);
          item.goodReviews++;
        } else if (log.rating === Rating.Hard) {
          item.goodReviews += 0.5;
        }

        // Mức 5 FSRS: Độ bền stability >= 30 ngày (Ghi nhớ sâu / Đã thuộc)
        const stab = Number(log.stability) || Number(log.scheduledDays) || 0;
        if (stab >= MASTERY_STABILITY_THRESHOLD || (log.newState === State.Review && stab >= MASTERY_STABILITY_THRESHOLD)) {
          item.masteredWords.add(cardId);
        } else if (log.rating === Rating.Good || log.rating === Rating.Easy) {
          const curState = cardStates[cardId];
          if (curState && Number(curState.stability) >= MASTERY_STABILITY_THRESHOLD) {
            item.masteredWords.add(cardId);
          }
        }
      }
    }
  }

  // Tổng hợp danh sách ngày trong tháng
  const days = [];
  const monthMasteredSet = new Set();
  let monthTotalWords = 0;
  let activeDaysCount = 0;
  let monthTotalSeconds = 0;
  let monthTotalReviews = 0;
  let monthGoodReviews = 0;

  let currentStreak = 0;
  let maxStreakInMonth = 0;

  const streakState = StorageManager.getStreakState();
  const frozenSet = new Set(streakState?.frozenDates || []);
  const recoveredSet = new Set(streakState?.recoveredDates || []);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const item = dailyMap[dateKey];
    
    const uniqueWords = new Set([...item.wordsLearned, ...item.wordsReviewed]);
    const totalCount = uniqueWords.size || item.memorizedWords.size;
    const count = totalCount;
    const retention = item.totalReviews > 0 ? Math.round((item.goodReviews / item.totalReviews) * 100) : (count > 0 ? 100 : 0);
    
    item.masteredWords.forEach(w => monthMasteredSet.add(w));

    monthTotalWords += count;
    monthTotalSeconds += item.studySeconds;
    monthTotalReviews += item.totalReviews;
    monthGoodReviews += item.goodReviews;

    const isFrozen = frozenSet.has(dateKey);
    const isRecovered = recoveredSet.has(dateKey);

    let heatLevel = 0;
    if (count > 0 || isFrozen || isRecovered) {
      activeDaysCount++;
      currentStreak++;
      if (currentStreak > maxStreakInMonth) maxStreakInMonth = currentStreak;

      if (count >= 30) heatLevel = 4;
      else if (count >= 15) heatLevel = 3;
      else if (count >= 6) heatLevel = 2;
      else heatLevel = 1;
    } else {
      if (!item.isFuture) {
        currentStreak = 0;
      }
    }

    days.push({
      day: d,
      dateKey,
      count,
      newCount: item.wordsLearned.size,
      reviewCount: item.wordsReviewed.size,
      memorizedCount: item.memorizedWords.size,
      masteredCount: item.masteredWords.size,
      totalReviews: item.totalReviews,
      retention,
      minutes: Math.round(item.studySeconds / 60),
      heatLevel,
      isToday: item.isToday,
      isFuture: item.isFuture,
      isFrozen,
      isRecovered
    });
  }

  const elapsedDays = isCurrentMonth ? currentDay : daysInMonth;
  const winRate = elapsedDays > 0 ? Math.round((activeDaysCount / elapsedDays) * 100) : 0;
  const avgRetention = monthTotalReviews > 0 ? Math.round((monthGoodReviews / monthTotalReviews) * 100) : 100;

  return {
    year,
    month,
    daysInMonth,
    firstDayOfWeek, // Số ô trống cần pad trước ngày 1 (0..6)
    days,
    monthTotalWords,
    monthMasteredWords: monthMasteredSet.size,
    activeDaysCount,
    elapsedDays,
    winRate,
    maxStreakInMonth,
    monthTotalMinutes: Math.round(monthTotalSeconds / 60),
    avgRetention
  };
}

/**
 * Lấy dữ liệu 12 tháng trong năm (Year Overview)
 * @param {number} year - Năm (vd: 2026)
 */
export function getYearJournalData(year) {
  const months = [];
  let yearTotalWords = 0;
  let yearActiveDays = 0;
  let yearTotalMinutes = 0;
  let maxMonthWords = 0;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  for (let m = 1; m <= 12; m++) {
    const data = getMonthJournalData(year, m);
    const isCurrentMonth = (year === currentYear && m === currentMonth);
    const wordsCount = data.monthTotalWords || 0;
    const activeDays = data.activeDaysCount || 0;
    const minutes = data.monthTotalMinutes || 0;

    if (wordsCount > maxMonthWords) {
      maxMonthWords = wordsCount;
    }

    yearTotalWords += wordsCount;
    yearActiveDays += activeDays;
    yearTotalMinutes += minutes;

    months.push({
      ...data,
      month: m,
      monthName: `Tháng ${m}`,
      isCurrentMonth,
      wordsCount,
      activeDays,
      minutes
    });
  }

  return {
    year,
    months,
    maxMonthWords,
    yearTotalWords,
    yearActiveDays,
    yearTotalMinutes
  };
}

/**
 * Alias cho getYearJournalData để đảm bảo tương thích ngược
 */
export function getYearlyJournalData(year) {
  return getYearJournalData(year);
}

// StudyTimeTracker & BehavioralOptimizer đã được module hóa sang ./timer.js và ./optimizer.js
