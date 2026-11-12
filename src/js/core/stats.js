/**
 * Stats & Analytics Manager + Active Study Timer for FSRS-6 English Learning
 */

import { StorageManager } from '../services/storage.js';
import { State, Rating, FSRS } from './fsrs.js';
import { MASTERY_STABILITY_THRESHOLD, getLearningGoal, STREAK_COOLDOWN_DAYS } from '../config.js';
import { getLocalDateKey, normalizePos } from '../utils.js';
import { StudyTimeTracker, globalStudyTimer } from './timer.js';
import { BehavioralOptimizer } from './optimizer.js';

import { getComprehensionPower, getCefrRoadmapAndForecast, getDailyMicroQuests } from './stats/roadmap.js';
import { getPrimeStudyHour, getWeeklyProgress, get7DaysForecast, getMonthJournalData, getYearJournalData, getYearlyJournalData } from './stats/journal.js';

export { StudyTimeTracker, globalStudyTimer, BehavioralOptimizer };


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
      if (state && (state.isLeech === true || (state.lapses && state.lapses >= 8))) {
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
   * Tự động tích hợp Khiên bảo vệ (frozenDates) và Ngày cứu (recoveredDates)
   * Tự động hợp nhất ngày từ study_time, streakState.studiedDates và logs
   * Khôi phục tự động (Auto-heal) nếu chuỗi dài bị cụt do LocalStorage cắt 500 logs
   * Tự động kiểm tra thưởng Khiên đóng băng khi đạt mốc liên tục 7 ngày
   */
  static calculateStreak(logs = null, explicitStreakState = null) {
    const streakState = explicitStreakState || StorageManager.getStreakState();
    const frozenSet = new Set(streakState?.frozenDates || []);
    const recoveredSet = new Set(streakState?.recoveredDates || []);

    const dateSet = new Set(streakState?.studiedDates || []);

    // 1. Nạp tất cả các ngày từ study_time (Lưu trữ thời gian học vĩnh viễn theo ngày)
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

    if (dateSet.size === 0 && frozenSet.size === 0 && recoveredSet.size === 0) {
      return 0;
    }

    let streak = 0;
    const today = new Date();
    let brokenAtDay = -1;
    
    // Kiểm tra từ hôm nay lùi về quá khứ (tối đa 730 ngày ~ 2 năm)
    for (let i = 0; i < 730; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getLocalDateKey(d);
      
      const isStudied = dateSet.has(key);
      const isFrozen = frozenSet.has(key);
      const isRecovered = recoveredSet.has(key);

      if (isStudied || isFrozen || isRecovered) {
        streak++;
      } else {
        // Nếu hôm nay chưa học thì vẫn cho phép tính streak từ ngày hôm qua
        if (i === 0) continue;
        brokenAtDay = i;
        break;
      }
    }

    // 3. AUTO-HEAL: Khôi phục chuỗi nếu bị đứt do hiện tượng LocalStorage cắt 500 logs gần nhất (slice -500)
    // Nếu người dùng có kỷ lục longestStreak >= 5 và chuỗi hiện tại liên tục không đứt quãng cho đến
    // tận ngày sớm nhất có dữ liệu (earliest date in dateSet), tức là chuỗi bị cụt do hết dữ liệu logs chứ
    // không phải do người dùng bỏ học, ta tự động bù đắp các ngày liên tục còn thiếu lên đến longestStreak.
    const longestStreak = Number(streakState?.longestStreak) || 0;
    if (longestStreak > streak && brokenAtDay > 0) {
      let earliestDate = null;
      for (const dStr of dateSet) {
        if (!earliestDate || dStr < earliestDate) earliestDate = dStr;
      }

      const brokenDateObj = new Date(today);
      brokenDateObj.setDate(today.getDate() - brokenAtDay);
      const brokenDateKey = getLocalDateKey(brokenDateObj);

      // Nếu ngày bị đứt nằm ở ngoài rìa dữ liệu (brokenDateKey <= earliestDate)
      // thì chắc chắn là do giới hạn cắt lát 500 logs của LocalStorage
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

        // Lưu vĩnh viễn các ngày được khôi phục vào streakState.studiedDates để không bao giờ bị mất lại
        try {
          const curState = StorageManager.getStreakState();
          const curDates = new Set(curState.studiedDates || []);
          datesToBackfill.forEach(d => curDates.add(d));
          curState.studiedDates = Array.from(curDates);
          StorageManager.saveStreakState(curState);
        } catch (e) {}
      }
    }

    // 4. Đồng bộ ngược các ngày phát hiện được vào streakState.studiedDates
    if (dateSet.size > (streakState?.studiedDates?.length || 0)) {
      try {
        const curState = StorageManager.getStreakState();
        curState.studiedDates = Array.from(dateSet);
        StorageManager.saveStreakState(curState);
      } catch (e) {}
    }

    // Tự động kiểm tra thưởng khiên đóng băng và cập nhật kỷ lục
    if (streak > 0 && typeof StorageManager.checkAndAwardStreakFreeze === 'function') {
      try {
        StorageManager.checkAndAwardStreakFreeze(streak);
      } catch (e) {}
    }

    return streak;
  }

  /**
   * Tự động phân tích xem chuỗi ngày học có vừa bị đứt trong 24h - 48h gần nhất hay không
   * Trả về thông tin chi tiết để phục vụ việc cứu chuỗi (Dùng khiên hoặc Thử thách chuộc lỗi)
   */
  static detectBrokenStreak(logs = null, explicitStreakState = null) {
    const studyLogs = logs || StorageManager.getStudyLogs() || [];
    const streakState = explicitStreakState || StorageManager.getStreakState();
    const frozenSet = new Set(streakState?.frozenDates || []);
    const recoveredSet = new Set(streakState?.recoveredDates || []);

    const dateSet = new Set(streakState?.studiedDates || []);
    const timeMap = StorageManager.getStudyTimeMap() || {};
    for (const [dateKey, seconds] of Object.entries(timeMap)) {
      if (Number(seconds) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        dateSet.add(dateKey);
      }
    }
    for (let i = 0; i < studyLogs.length; i++) {
      const l = studyLogs[i];
      if (!l) continue;
      const ts = l.timestamp || l.review || l.review_time || l.date;
      if (ts) {
        const k = getLocalDateKey(ts);
        if (k && /^\d{4}-\d{2}-\d{2}$/.test(k)) dateSet.add(k);
      }
    }

    if (dateSet.size === 0 && frozenSet.size === 0 && recoveredSet.size === 0) {
      return { isBroken: false, canRecover: false };
    }

    const isValidDate = (key) => dateSet.has(key) || frozenSet.has(key) || recoveredSet.has(key);

    const today = new Date();
    const todayKey = getLocalDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);

    // Nếu hôm qua đã học / đã đóng băng / đã cứu -> Streak KHÔNG bị đứt!
    if (isValidDate(yesterdayKey)) {
      return { isBroken: false, canRecover: false };
    }

    // Hôm qua bị lỡ (missed). Kiểm tra xem từ hôm kia (D-2) trở về trước có chuỗi nỗ lực không:
    let pastStreakBeforeMiss = 0;
    for (let i = 2; i < 730; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = getLocalDateKey(d);
      if (isValidDate(k)) {
        pastStreakBeforeMiss++;
      } else {
        break;
      }
    }

    // Nếu trước hôm qua không có ngày nào học liên tục -> Không có chuỗi để cứu
    if (pastStreakBeforeMiss === 0) {
      return { isBroken: false, canRecover: false };
    }

    const studiedToday = dateSet.has(todayKey);
    const potentialRestoredStreak = pastStreakBeforeMiss + 1 + (studiedToday ? 1 : 0);

    const freezes = Number(streakState?.freezes || 0);
    const canUseFreeze = freezes > 0;

    // Cooldown 14 ngày cho Thử Thách Chuộc Lỗi
    const cooldownMs = (STREAK_COOLDOWN_DAYS || 14) * 86400000;
    const lastRecovery = Number(streakState?.lastRecoveryTimestamp || 0);
    const timeSinceLast = Date.now() - lastRecovery;
    const isCooldownActive = lastRecovery > 0 && timeSinceLast < cooldownMs;
    const cooldownDaysLeft = isCooldownActive ? Math.ceil((cooldownMs - timeSinceLast) / 86400000) : 0;
    const canRedeem = !isCooldownActive;

    return {
      isBroken: true,
      canRecover: true,
      missedDate: yesterdayKey,
      pastStreakBeforeMiss,
      potentialRestoredStreak,
      studiedToday,
      freezesAvailable: freezes,
      canUseFreeze,
      canRedeem,
      cooldownDaysLeft
    };
  }

  /**
   * Tính toán Thước Đo Năng Lực Đọc Hiểu Tiếng Anh Thực Tế (Comprehension Power Meter)
   * Dựa trên phân tích tần suất từ vựng Zipf's Law & Khung chuẩn Oxford 3000
   */
  static getComprehensionPower(learnedCount = 0) {
    return getComprehensionPower(learnedCount);
  }

  static getCefrRoadmapAndForecast(allCards = [], settings = {}) {
    return getCefrRoadmapAndForecast(allCards, settings);
  }

  static getDailyMicroQuests(allLogs = [], studyQueue = {}, dailyNewGoal = 10) {
    return getDailyMicroQuests(allLogs, studyQueue, dailyNewGoal);
  }

  static getPrimeStudyHour(logs = []) {
    return getPrimeStudyHour(logs);
  }

  static getWeeklyProgress(logs) {
    return getWeeklyProgress(logs);
  }

  static get7DaysForecast(cardStates) {
    return get7DaysForecast(cardStates);
  }

  static getMonthJournalData(year, month) {
    return getMonthJournalData(year, month);
  }

  static getYearJournalData(year) {
    return getYearJournalData(year);
  }

  static getYearlyJournalData(year) {
    return getYearlyJournalData(year);
  }
}
