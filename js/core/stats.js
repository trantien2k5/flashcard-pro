/**
 * Stats & Analytics Manager + Active Study Timer for FSRS-6 English Learning
 */

import { StorageManager } from '../services/storage.js';
import { State, Rating, FSRS } from './fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../config.js';
import { getLocalDateKey } from '../utils.js';

export class StatsManager {
  /**
   * Phân tích chuyên sâu Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6
   */
  static getMemoryIntelligence(allCards = []) {
    const cardStates = StorageManager.getAllCardStates() || {};
    const logs = StorageManager.getStudyLogs() || [];
    const now = new Date();
    const fsrs = new FSRS();

    let totalLearned = 0;
    let totalRetrievability = 0;
    let totalStability = 0;
    let totalDifficulty = 0;
    let ratedCount = 0;

    // 5 Tầng Độ Bền Trí Nhớ (Stability Tiers)
    const tiers = {
      tier5: { id: 'tier5', count: 0, label: 'Nhớ sâu vĩnh viễn', desc: 'Độ bền ≥ 30 ngày (Chu kỳ ôn 1 - 6 tháng)', icon: '💎', color: '#10b981', lightColor: '#059669' },
      tier4: { id: 'tier4', count: 0, label: 'Ghi nhớ bền vững', desc: 'Độ bền 14 - 30 ngày (Chu kỳ ôn 2 - 4 tuần)', icon: '🛡️', color: '#06b6d4', lightColor: '#0891b2' },
      tier3: { id: 'tier3', count: 0, label: 'Ghi nhớ trung hạn', desc: 'Độ bền 7 - 14 ngày (Chu kỳ ôn 1 - 2 tuần)', icon: '🌳', color: '#3b82f6', lightColor: '#2563eb' },
      tier2: { id: 'tier2', count: 0, label: 'Trí nhớ ngắn hạn', desc: 'Độ bền 3 - 7 ngày (Chu kỳ ôn 3 - 7 ngày)', icon: '🌿', color: '#f59e0b', lightColor: '#d97706' },
      tier1: { id: 'tier1', count: 0, label: 'Mới nạp vào não', desc: 'Độ bền < 3 ngày (Cần củng cố hàng ngày)', icon: '🌱', color: '#a855f7', lightColor: '#7c3aed' }
    };

    let lapsedCardsCount = 0;
    let recoveredCardsCount = 0;
    let leechCount = 0;
    let suspendedCount = 0;

    // Quét toàn bộ thẻ đã lưu trạng thái trong bộ nhớ
    const states = Object.values(cardStates);
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      if (state && state.suspended === true) {
        suspendedCount++;
      }
      if (state && (state.isLeech === true || (state.lapses && state.lapses >= 6))) {
        leechCount++;
      }
      if (!state || state.state === State.New || state.state === 0) {
        continue;
      }

      totalLearned++;
      const s = Number(state.stability) || 0;
      const d = Number(state.difficulty) || 5;

      if (s > 0) {
        totalStability += s;
        totalDifficulty += d;
        ratedCount++;

        // Tính Retrievability thời điểm hiện tại bằng FSRS-6: R(t) = (1 + factor * t / S)^(-decay)
        const r = fsrs.getRetrievability(state, now);
        totalRetrievability += r;

        // Phân loại 5 tầng độ bền FSRS
        if (s >= 30) tiers.tier5.count++;
        else if (s >= 14) tiers.tier4.count++;
        else if (s >= 7) tiers.tier3.count++;
        else if (s >= 3) tiers.tier2.count++;
        else tiers.tier1.count++;
      } else {
        tiers.tier1.count++;
      }

      if (state.lapses && state.lapses > 0) {
        lapsedCardsCount++;
        if (s >= 3) {
          recoveredCardsCount++;
        }
      }
    }

    // Tỉ lệ nhớ thật hiện tại (Real Retrievability % trung bình của các thẻ đã học)
    const currentRetrievability = ratedCount > 0 
      ? Math.round((totalRetrievability / ratedCount) * 100) 
      : 0;

    const avgStability = ratedCount > 0 ? (totalStability / ratedCount).toFixed(1) : '0';
    const avgDifficulty = ratedCount > 0 ? (totalDifficulty / ratedCount).toFixed(1) : '5.0';

    // Thống kê phân bố 4 phản hồi (Rating breakdown) từ logs
    const ratingCounts = {
      [Rating.Again]: 0,
      [Rating.Hard]: 0,
      [Rating.Good]: 0,
      [Rating.Easy]: 0
    };
    let totalRatings = 0;

    for (let i = 0; i < logs.length; i++) {
      const r = logs[i].rating;
      if (ratingCounts[r] !== undefined) {
        ratingCounts[r]++;
        totalRatings++;
      }
    }

    const ratingPct = {
      again: totalRatings > 0 ? Math.round((ratingCounts[Rating.Again] / totalRatings) * 100) : 0,
      hard: totalRatings > 0 ? Math.round((ratingCounts[Rating.Hard] / totalRatings) * 100) : 0,
      good: totalRatings > 0 ? Math.round((ratingCounts[Rating.Good] / totalRatings) * 100) : 0,
      easy: totalRatings > 0 ? Math.round((ratingCounts[Rating.Easy] / totalRatings) * 100) : 0
    };

    const firstTryAccuracy = totalRatings > 0 
      ? Math.round(((ratingCounts[Rating.Good] + ratingCounts[Rating.Easy]) / totalRatings) * 100)
      : 0;

    const recoveryRate = lapsedCardsCount > 0 
      ? Math.round((recoveredCardsCount / lapsedCardsCount) * 100)
      : (totalLearned > 0 ? 100 : 0);

    // Tính Điểm Năng Lực Trí Nhớ (Cognitive Memory Index 0 - 1000)
    const deepMastered = tiers.tier5.count;
    const solidMastered = tiers.tier4.count;
    const streak = this.calculateStreak(logs);

    let score = Math.round(
      Math.min(500, deepMastered * 2.5 + solidMastered * 1.5 + (totalLearned - deepMastered - solidMastered) * 0.5) +
      (currentRetrievability / 100) * 300 +
      Math.min(200, streak * 15 + Math.min(50, totalLearned * 0.1))
    );
    score = Math.max(0, Math.min(1000, score));

    // Xếp hạng Trí Nhớ & Danh Hiệu
    let rank = { title: '🌱 Khởi Động', level: 1, color: '#8b5cf6', badge: 'Tập Sự' };
    if (score >= 850) {
      rank = { title: '👑 Bậc Thầy Trí Nhớ', level: 5, color: '#10b981', badge: 'Grandmaster' };
    } else if (score >= 600) {
      rank = { title: '🏆 Tinh Anh FSRS', level: 4, color: '#06b6d4', badge: 'Master' };
    } else if (score >= 350) {
      rank = { title: '⭐ Trí Nhớ Bền Bỉ', level: 3, color: '#3b82f6', badge: 'Expert' };
    } else if (score >= 150) {
      rank = { title: '🌿 Đang Bứt Phá', level: 2, color: '#f59e0b', badge: 'Pro' };
    }

    return {
      totalLearned,
      currentRetrievability,
      avgStability,
      avgDifficulty,
      tiers,
      ratingCounts,
      ratingPct,
      totalRatings,
      firstTryAccuracy,
      recoveryRate,
      lapsedCardsCount,
      leechCount,
      suspendedCount,
      score,
      rank,
      streak
    };
  }

  /**
   * Tính toán toàn bộ chỉ số thống kê tổng hợp
   */
  static getOverallStats(allCards = []) {
    const cardStates = StorageManager.getAllCardStates();
    const logs = StorageManager.getStudyLogs();
    const now = new Date();

    let totalCards = allCards.length;
    let newCardsCount = 0;
    let learningCardsCount = 0;
    let reviewCardsCount = 0;
    let masteredCardsCount = 0;
    let totalStability = 0;
    let totalDifficulty = 0;
    let ratedCardsCount = 0;

    // Stability Breakdown
    const stabilityBuckets = {
      short: 0,   // < 3 days
      medium: 0,  // 3 - 14 days
      long: 0,    // 14 - 30 days
      mature: 0   // > 30 days
    };

    // Difficulty Breakdown
    const difficultyBuckets = {
      easy: 0,   // 1 - 4
      medium: 0, // 4.1 - 7
      hard: 0    // 7.1 - 10
    };

    let learnedCards = 0;
    let goodMemoryCount = 0; // Đang nhớ tốt (độ bền >= 3 ngày)

    for (const card of allCards) {
      const state = StorageManager.getCardState(card.id);
      if (!state || state.state === State.New || state.state === 0) {
        newCardsCount++;
      } else {
        learnedCards++;
        if (state.state === State.Learning || state.state === State.Relearning) {
          learningCardsCount++;
        } else if (state.state === State.Review) {
          reviewCardsCount++;
          if (state.stability >= MASTERY_STABILITY_THRESHOLD) {
            masteredCardsCount++;
          }
        }

        if (state.stability > 0) {
          totalStability += state.stability;
          totalDifficulty += (state.difficulty || 5);
          ratedCardsCount++;

          if (state.stability < 3) {
            stabilityBuckets.short++;
          } else if (state.stability <= 14) {
            stabilityBuckets.medium++;
            goodMemoryCount++;
          } else if (state.stability <= 30) {
            stabilityBuckets.long++;
            goodMemoryCount++;
          } else {
            stabilityBuckets.mature++;
            goodMemoryCount++;
          }

          const d = state.difficulty || 5;
          if (d <= 4) difficultyBuckets.easy++;
          else if (d <= 7) difficultyBuckets.medium++;
          else difficultyBuckets.hard++;
        }
      }
    }

    // Tỉ lệ nhớ Retention Rate thực tế: (Số từ nhớ tốt / Tổng từ đã học) * 100
    const retentionRate = learnedCards > 0 
      ? Math.round((goodMemoryCount / learnedCards) * 100) 
      : 100;

    // Streak & Ngày học
    const streak = this.calculateStreak(logs);
    const weeklyActivity = this.getWeeklyProgress(logs);
    const forecast7Days = this.get7DaysForecast(cardStates);

    return {
      totalCards,
      learnedCards,
      goodMemoryCount,
      newCardsCount,
      learningCardsCount,
      reviewCardsCount,
      masteredCardsCount,
      totalReviews: logs.length,
      retentionRate,
      streak,
      avgStability: ratedCardsCount > 0 ? (totalStability / ratedCardsCount).toFixed(1) : '0',
      avgDifficulty: ratedCardsCount > 0 ? (totalDifficulty / ratedCardsCount).toFixed(1) : '0',
      stabilityBuckets,
      difficultyBuckets,
      weeklyActivity,
      forecast7Days
    };
  }

  /**
   * Tính toán chuỗi ngày học liên tục (Streak)
   */
  static calculateStreak(logs) {
    if (!logs || logs.length === 0) return 0;

    const dateSet = new Set();
    for (let i = 0; i < logs.length; i++) {
      const ts = logs[i].timestamp;
      if (ts) {
        dateSet.add(getLocalDateKey(ts));
      }
    }

    let streak = 0;
    const today = new Date();
    
    // Kiểm tra từ hôm nay lùi về quá khứ
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getLocalDateKey(d);
      
      if (dateSet.has(key)) {
        streak++;
      } else {
        // Nếu hôm nay chưa học thì vẫn cho phép tính streak từ ngày hôm qua
        if (i === 0) continue;
        break;
      }
    }

    return streak;
  }

  /**
   * Phân tích Khung Giờ Vàng Nhận Thức (Prime Cognitive Study Hour)
   */
  static getPrimeStudyHour(logs = []) {
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
  static getWeeklyProgress(logs) {
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
  static get7DaysForecast(cardStates) {
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
  static getMonthJournalData(year, month) {
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

          // Tầng 4 & 5 FSRS: Độ bền stability >= 14 ngày (Từ đã thuộc)
          const stab = Number(log.stability) || Number(log.scheduledDays) || 0;
          if (stab >= 14 || (log.newState === State.Review && stab >= 14)) {
            item.masteredWords.add(cardId);
          } else if (log.rating === Rating.Good || log.rating === Rating.Easy) {
            const curState = cardStates[cardId];
            if (curState && Number(curState.stability) >= 14) {
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

      let heatLevel = 0;
      if (count > 0) {
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
        isFuture: item.isFuture
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
  static getYearJournalData(year) {
    const months = [];
    let yearTotalWords = 0;
    let yearActiveDays = 0;
    let yearTotalMinutes = 0;
    let maxMonthWords = 0;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    for (let m = 1; m <= 12; m++) {
      const data = this.getMonthJournalData(year, m);
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
  static getYearlyJournalData(year) {
    return this.getYearJournalData(year);
  }
}

export class StudyTimeTracker {
  constructor() {
    this.isActiveSession = false;
    this.isPaused = false;
    this.isIdle = false;

    this.idleThresholdMs = 25 * 1000; // 25 giây không có tương tác -> coi như treo máy
    this.lastActivityTime = 0;
    this.lastTickTime = 0;
    this.unflushedSeconds = 0;

    this.intervalId = null;
    this._boundOnVisibilityChange = this._onVisibilityChange.bind(this);
    this._boundOnUserActivity = this.recordActivity.bind(this);
  }

  /**
   * Bắt đầu theo dõi thời gian cho phiên học
   */
  startSession() {
    if (this.isActiveSession) {
      this.flush();
    }

    const now = Date.now();
    this.isActiveSession = true;
    this.isPaused = false;
    this.isIdle = false;
    this.lastActivityTime = now;
    this.lastTickTime = now;
    this.unflushedSeconds = 0;

    // Lắng nghe sự kiện tab ẩn/hiện
    document.addEventListener('visibilitychange', this._boundOnVisibilityChange);
    window.addEventListener('pagehide', this._boundOnVisibilityChange);

    // Lắng nghe tương tác người dùng để duy trì trạng thái active
    const overlay = document.getElementById('study-overlay');
    if (overlay) {
      overlay.addEventListener('pointerdown', this._boundOnUserActivity, { passive: true });
      overlay.addEventListener('keydown', this._boundOnUserActivity, { passive: true });
      overlay.addEventListener('touchstart', this._boundOnUserActivity, { passive: true });
    }

    // Bắt đầu chu kỳ đếm 1s/lần
    this._startTicker();
  }

  /**
   * Ghi nhận người dùng vừa có hành vi học (lật thẻ, chấm điểm, nghe âm thanh, chạm)
   */
  recordActivity() {
    if (!this.isActiveSession) return;
    
    const now = Date.now();
    this.lastActivityTime = now;

    // Nếu trước đó đang bị tính là treo máy thì kích hoạt lại bộ đếm từ thời điểm này
    if (this.isIdle) {
      this.isIdle = false;
      this.lastTickTime = now;
    }
  }

  /**
   * Tạm dừng hoặc tiếp tục khi tab thay đổi trạng thái ẩn/hiện
   */
  _onVisibilityChange() {
    if (!this.isActiveSession) return;

    if (document.visibilityState === 'hidden') {
      this.pause();
    } else if (document.visibilityState === 'visible') {
      this.resume();
    }
  }

  pause() {
    if (!this.isActiveSession || this.isPaused) return;
    this._tick();
    this.flush();
    this.isPaused = true;
  }

  resume() {
    if (!this.isActiveSession || !this.isPaused) return;
    const now = Date.now();
    this.isPaused = false;
    this.isIdle = false;
    this.lastActivityTime = now;
    this.lastTickTime = now;
  }

  _startTicker() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this._tick();
    }, 1000);
  }

  _tick() {
    if (!this.isActiveSession || this.isPaused) return;

    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // Kiểm tra phát hiện treo máy
    if (timeSinceLastActivity > this.idleThresholdMs) {
      this.isIdle = true;
      this.lastTickTime = now;
      return;
    }

    // Tính số giây thực tế trôi qua giữa 2 nhịp tick
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    if (deltaMs > 0 && deltaMs < 5000) { // Bỏ qua nếu có độ trễ bất thường
      this.unflushedSeconds += (deltaMs / 1000);
    }

    // Flush định kỳ mỗi khi tích lũy đủ 5 giây
    if (this.unflushedSeconds >= 5) {
      this.flush();
    }
  }

  /**
   * Lưu số giây tích lũy vào StorageManager
   */
  flush() {
    try {
      if (this.unflushedSeconds >= 0.5) {
        const secsToSave = Math.floor(this.unflushedSeconds);
        if (secsToSave > 0) {
          if (typeof StorageManager.addStudySeconds === 'function') {
            StorageManager.addStudySeconds(secsToSave);
          }
          this.unflushedSeconds -= secsToSave;
        }
      }
    } catch (err) {
      console.error('Lỗi khi flush study time:', err);
    }
  }

  /**
   * Kết thúc phiên học, gỡ bỏ listeners và flush toàn bộ thời gian còn lại
   */
  endSession() {
    if (!this.isActiveSession) return;

    this._tick();
    this.flush();

    this.isActiveSession = false;
    this.isPaused = false;
    this.isIdle = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    document.removeEventListener('visibilitychange', this._boundOnVisibilityChange);
    window.removeEventListener('pagehide', this._boundOnVisibilityChange);

    const overlay = document.getElementById('study-overlay');
    if (overlay) {
      overlay.removeEventListener('pointerdown', this._boundOnUserActivity);
      overlay.removeEventListener('keydown', this._boundOnUserActivity);
      overlay.removeEventListener('touchstart', this._boundOnUserActivity);
    }
  }
}

export const globalStudyTimer = new StudyTimeTracker();
