/**
 * Stats & Analytics Manager + Active Study Timer for FSRS-6 English Learning
 */

import { StorageManager } from '../services/storage.js';
import { State, Rating, FSRS } from './fsrs.js';
import { MASTERY_STABILITY_THRESHOLD, getLearningGoal, STREAK_COOLDOWN_DAYS } from '../config.js';
import { getLocalDateKey, normalizePos } from '../utils.js';
import { StudyTimeTracker, globalStudyTimer } from './timer.js';
import { BehavioralOptimizer } from './optimizer.js';

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
    const count = Math.max(0, Number(learnedCount) || 0);

    let pct = 0;
    let rankTitle = 'Khởi Đầu';
    let impactDesc = 'Nhận diện các từ vựng căn bản đầu tiên';
    let nextMilestone = 100;
    let badgeIcon = '🌱';

    if (count === 0) {
      pct = 0;
      rankTitle = 'Chưa Bắt Đầu';
      impactDesc = 'Hãy học 10 từ đầu tiên để mở khóa 15% khả năng hiểu!';
      nextMilestone = 50;
      badgeIcon = '✨';
    } else if (count < 50) {
      pct = Math.min(25, Math.round((count / 50) * 25));
      rankTitle = 'Mầm Non Ngôn Ngữ';
      impactDesc = `Đã hiểu ${pct}% từ vựng căn bản. Thêm ${50 - count} từ để chạm mốc 50 từ!`;
      nextMilestone = 50;
      badgeIcon = '🌱';
    } else if (count < 150) {
      pct = Math.min(45, Math.round(25 + ((count - 50) / 100) * 20));
      rankTitle = 'Giao Tiếp Sơ Cấp (A1)';
      impactDesc = `Đã hiểu ~${pct}% bảng hiệu, câu chào, hỏi đường & mua sắm cơ bản!`;
      nextMilestone = 150;
      badgeIcon = '🌿';
    } else if (count < 300) {
      pct = Math.min(65, Math.round(45 + ((count - 150) / 150) * 20));
      rankTitle = 'Hội Thoại Đời Sống (A2)';
      impactDesc = `Đã hiểu ~${pct}% các cuộc hội thoại đời sống, video ngắn & vlog!`;
      nextMilestone = 300;
      badgeIcon = '🚀';
    } else if (count < 600) {
      pct = Math.min(78, Math.round(65 + ((count - 300) / 300) * 13));
      rankTitle = 'Tự Tin Giao Tiếp (B1)';
      impactDesc = `Đã hiểu ~${pct}% tiếng Anh thường ngày, tự tin xem phim có phụ đề!`;
      nextMilestone = 600;
      badgeIcon = '🎯';
    } else if (count < 1200) {
      pct = Math.min(88, Math.round(78 + ((count - 600) / 600) * 10));
      rankTitle = 'Lưu Loát & Công Sở (B2)';
      impactDesc = `Đã hiểu ~${pct}% tiếng Anh công sở, viết email & phỏng vấn xin việc!`;
      nextMilestone = 1200;
      badgeIcon = '💼';
    } else {
      pct = Math.min(96, Math.round(88 + ((count - 1200) / 1382) * 8));
      rankTitle = 'Chuyên Gia Ngôn Ngữ (C1/C2)';
      impactDesc = `Đã hiểu ~${pct}% tiếng Anh học thuật & đọc báo chí chuyên ngành!`;
      nextMilestone = 2582;
      badgeIcon = '👑';
    }

    return {
      count,
      percent: pct,
      rankTitle,
      impactDesc,
      nextMilestone,
      badgeIcon,
      wordsNeededForNext: Math.max(0, nextMilestone - count)
    };
  }

  /**
   * Tính toán toàn diện Lộ trình Trình độ CEFR & Dự báo nhịp độ học thích ứng (Dynamic Adaptive ETA Engine)
   */
  static getCefrRoadmapAndForecast(allCards = [], settings = {}) {
    const cardStates = StorageManager.getAllCardStates() || {};
    const logs = StorageManager.getStudyLogs() || [];
    const now = new Date();
    const rolloverHour = Number(settings.rolloverHour) || 0;

    const activeGoalId = settings.activeGoal?.id || 'cefr-b1';
    const activeGoal = getLearningGoal(activeGoalId);
    const targetWords = Number(settings.activeGoal?.targetWords) || activeGoal.defaultTargetWords || 3027;
    const stateRev = StorageManager.getStateRevision ? StorageManager.getStateRevision() : 0;
    const cacheKey = `${activeGoalId}_${targetWords}_${stateRev}_${logs.length}_${rolloverHour}_${allCards.length}`;

    if (!StatsManager._cefrRoadmapCache) {
      StatsManager._cefrRoadmapCache = new Map();
    }
    if (StatsManager._cefrRoadmapCache.has(cacheKey)) {
      return StatsManager._cefrRoadmapCache.get(cacheKey);
    }

    // 1. Phân loại theo từng bậc CEFR (A1, A2, B1, B2, C1)
    const levels = {
      A1: { id: 'A1', name: 'Căn Bản', fullTitle: 'Trình Độ A1 (Căn Bản Khởi Đầu)', color: '#10b981', total: 0, learned: 0, mastered: 0, byPos: { noun: 0, verb: 0, adj: 0, other: 0 }, remainingByPos: { noun: 0, verb: 0, adj: 0, other: 0 } },
      A2: { id: 'A2', name: 'Sơ Cấp', fullTitle: 'Trình Độ A2 (Giao Tiếp Đời Sống)', color: '#f59e0b', total: 0, learned: 0, mastered: 0, byPos: { noun: 0, verb: 0, adj: 0, other: 0 }, remainingByPos: { noun: 0, verb: 0, adj: 0, other: 0 } },
      B1: { id: 'B1', name: 'Trung Cấp', fullTitle: 'Trình Độ B1 (Trung Cấp Thực Chiến)', color: '#6366f1', total: 0, learned: 0, mastered: 0, byPos: { noun: 0, verb: 0, adj: 0, other: 0 }, remainingByPos: { noun: 0, verb: 0, adj: 0, other: 0 } },
      B2: { id: 'B2', name: 'Trung Cao Cấp', fullTitle: 'Trình Độ B2 (Chuyên Sâu Thương Mại)', color: '#8b5cf6', total: 0, learned: 0, mastered: 0, byPos: { noun: 0, verb: 0, adj: 0, other: 0 }, remainingByPos: { noun: 0, verb: 0, adj: 0, other: 0 } },
      C1: { id: 'C1', name: 'Cao Cấp', fullTitle: 'Trình Độ C1 (Học Thuật Chuyên Sâu)', color: '#ec4899', total: 0, learned: 0, mastered: 0, byPos: { noun: 0, verb: 0, adj: 0, other: 0 }, remainingByPos: { noun: 0, verb: 0, adj: 0, other: 0 } }
    };

    const targetCefrSet = new Set((activeGoal.targetCefr || ['A1', 'A2', 'B1']).map(c => c.toUpperCase()));
    const targetDecksSet = new Set(activeGoal.targetDecks || []);
    const isSpecialGoal = activeGoal.id === 'all-dictionary' || activeGoal.id === 'custom';

    let learnedGoalWords = 0;
    let matureMasteredWords = 0; // Stability >= 30d
    let solidProgressPoints = 0; // Trọng số độ bền tích lũy (0.25 -> 1.0)
    let remainingNeededPos = { noun: 0, verb: 0, adj: 0, other: 0 };

    // Duyệt qua 1 vòng duy nhất toàn bộ allCards (O(N) thay vì O(2N))
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const lvl = (card.level || card.cefr || 'A1').toUpperCase();
      const posKey = normalizePos(card.pos);

      const state = cardStates[card.id] || (StorageManager.getCardState ? StorageManager.getCardState(card.id) : null);
      const isLearned = state && state.state !== State.New && state.state !== 0 && !state.suspended;
      const s = isLearned ? (Number(state.stability) || 0) : 0;
      const isMastered = isLearned && (s >= MASTERY_STABILITY_THRESHOLD);

      if (levels[lvl]) {
        levels[lvl].total++;
        levels[lvl].byPos[posKey] = (levels[lvl].byPos[posKey] || 0) + 1;

        if (isLearned) {
          levels[lvl].learned++;
          if (isMastered) levels[lvl].mastered++;
        } else {
          levels[lvl].remainingByPos[posKey] = (levels[lvl].remainingByPos[posKey] || 0) + 1;
        }
      }

      // Thống kê Mục tiêu (Target Goal)
      const isCefrMatch = targetCefrSet.has(lvl);
      const isDeckMatch = targetDecksSet.has(card.deckId);
      if (isCefrMatch || isDeckMatch || isSpecialGoal) {
        if (isLearned) {
          learnedGoalWords++;
          if (s >= 30) {
            matureMasteredWords++;
            solidProgressPoints += 1.0;
          } else if (s >= 14) {
            solidProgressPoints += 0.75;
          } else if (s >= 7) {
            solidProgressPoints += 0.50;
          } else if (s >= 3) {
            solidProgressPoints += 0.25;
          } else {
            solidProgressPoints += 0.10;
          }
        } else {
          remainingNeededPos[posKey] = (remainingNeededPos[posKey] || 0) + 1;
        }
      }
    }

    // 2. Xác định Trình độ hiện tại (Current Evaluated Level)
    const a1Pct = levels.A1.total > 0 ? (levels.A1.learned / levels.A1.total) : 0;
    const a2Pct = levels.A2.total > 0 ? (levels.A2.learned / levels.A2.total) : 0;
    const b1Pct = levels.B1.total > 0 ? (levels.B1.learned / levels.B1.total) : 0;
    const b2Pct = levels.B2.total > 0 ? (levels.B2.learned / levels.B2.total) : 0;
    const c1Pct = levels.C1.total > 0 ? (levels.C1.learned / levels.C1.total) : 0;

    let currentLevelId = 'A1';
    let currentLevelProgress = 0;
    let nextLevelId = 'A2';

    if (a1Pct < 0.75) {
      currentLevelId = 'A1';
      currentLevelProgress = Math.round(a1Pct * 100);
      nextLevelId = 'A2';
    } else if (a2Pct < 0.75) {
      currentLevelId = 'A2';
      currentLevelProgress = Math.round(a2Pct * 100);
      nextLevelId = 'B1';
    } else if (b1Pct < 0.75) {
      currentLevelId = 'B1';
      currentLevelProgress = Math.round(b1Pct * 100);
      nextLevelId = 'B2';
    } else if (b2Pct < 0.75) {
      currentLevelId = 'B2';
      currentLevelProgress = Math.round(b2Pct * 100);
      nextLevelId = 'C1';
    } else {
      currentLevelId = 'C1';
      currentLevelProgress = Math.round(c1Pct * 100);
      nextLevelId = 'Master';
    }

    const remainingWordsToGoal = Math.max(0, targetWords - learnedGoalWords);
    const unmasteredWords = Math.max(0, targetWords - matureMasteredWords);
    const inLearningWords = Math.max(0, learnedGoalWords - matureMasteredWords);
    const goalCompletionPct = Math.min(100, Math.round((learnedGoalWords / targetWords) * 100));
    const goalMasteryPct = Math.min(100, Math.round((matureMasteredWords / targetWords) * 100));

    // 4. THUẬT TOÁN DỰ BÁO TIẾN ĐỘ FSRS THUẦN THỤC (Stability >= 30d) DỰA TRÊN HÀNH VI TỰ CHẤM
    // A. Phân tích Tỷ lệ Nhớ Thật & Tỷ lệ Quên từ lịch sử tự chấm
    let totalRatings = 0;
    let successfulRatings = 0; // Good (3) + Easy (4)
    let lapseRatings = 0; // Again (1)
    let hardRatings = 0; // Hard (2)

    for (let i = 0; i < logs.length; i++) {
      const r = logs[i].rating;
      if (r === Rating.Good || r === Rating.Easy) {
        successfulRatings++;
        totalRatings++;
      } else if (r === Rating.Again || r === Rating.Hard) {
        if (r === Rating.Again) lapseRatings++;
        if (r === Rating.Hard) hardRatings++;
        totalRatings++;
      }
    }

    const empiricalAccuracy = totalRatings >= 5 
      ? Math.max(0.60, Math.min(0.98, successfulRatings / totalRatings))
      : 0.88; // Mặc định chuẩn 88%
    const empiricalLapseRate = 1 - empiricalAccuracy;

    // Hệ số lặp lại trung bình để 1 từ ngấm sâu vào trí nhớ dài hạn (Reps per word to mature S >= 30d)
    const expectedRepsPerWord = Math.round((4.2 / (1 - empiricalLapseRate * 0.75)) * 10) / 10;

    // B. Phân tích Tốc độ nạp mới và số ngày hoạt động thực tế 7 ngày qua
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const seenNewCardIds = new Set();
    const recentNewLogs = [];
    for (let i = 0; i < logs.length; i++) {
      const l = logs[i];
      if (!l || !l.timestamp) continue;
      const logDate = new Date(l.timestamp);
      const isNew = l.oldState === State.New || l.oldState === 0 || l.isNew;
      if (isNew && logDate >= sevenDaysAgo) {
        const cId = l.cardId || l.word || `${i}`;
        if (!seenNewCardIds.has(cId)) {
          seenNewCardIds.add(cId);
          recentNewLogs.push(l);
        }
      }
    }

    const dailyNewCounts = {};
    for (let i = 0; i < recentNewLogs.length; i++) {
      const dKey = getLocalDateKey(recentNewLogs[i].timestamp, rolloverHour);
      dailyNewCounts[dKey] = (dailyNewCounts[dKey] || 0) + 1;
    }
    const activeDaysCount = Object.keys(dailyNewCounts).length;
    const totalRecentNew = recentNewLogs.length;

    let actualDailyVelocity = 0;
    if (activeDaysCount >= 2) {
      actualDailyVelocity = Math.round((totalRecentNew / activeDaysCount) * 10) / 10;
    } else if (totalRecentNew > 0) {
      actualDailyVelocity = totalRecentNew;
    }

    const configuredDailyTarget = Number(settings.activeGoal?.dailyNew) || Number(settings.dailyNewLimit) || 12;
    const benchmarkPace = 12; // Mặc định người học bình thường 12 từ/ngày
    const effectiveVelocity = actualDailyVelocity > 0 
      ? Math.max(3, actualDailyVelocity) 
      : (configuredDailyTarget || benchmarkPace);

    const isUsingRealBehavior = actualDailyVelocity > 0;

    // C. Tính toán Thời gian Cán Đích Thuần Thục FSRS Mức 5 (S >= 30 ngày)
    // 1. Số ngày nạp hết các từ mới còn lại:
    const daysToAcquireAllNew = remainingWordsToGoal > 0 && effectiveVelocity > 0 
      ? Math.ceil(remainingWordsToGoal / effectiveVelocity) 
      : 0;

    // 2. Thời gian củng cố (Consolidation Lead-time) để từ cuối cùng đạt S >= 30 ngày qua chu kỳ FSRS:
    const baseConsolidationLeadDays = Math.round(32 / Math.max(0.65, empiricalAccuracy));
    const consolidationBuffer = remainingWordsToGoal > 0
      ? Math.round(baseConsolidationLeadDays * (remainingWordsToGoal / targetWords))
      : (inLearningWords > 0 ? Math.round(20 * (inLearningWords / targetWords)) : 0);

    const etaDays = unmasteredWords === 0 
      ? 0 
      : Math.max(1, daysToAcquireAllNew + consolidationBuffer);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + etaDays);
    const targetDateFormatted = targetDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    let paceStatus = 'Chuẩn nhịp FSRS';
    let paceBadgeColor = '#10b981';
    if (isUsingRealBehavior) {
      if (actualDailyVelocity >= configuredDailyTarget * 1.2) {
        paceStatus = `⚡ Vượt tiến độ (${actualDailyVelocity} từ/ngày • Độ nhớ ${Math.round(empiricalAccuracy * 100)}%)`;
        paceBadgeColor = '#6366f1';
      } else if (actualDailyVelocity >= configuredDailyTarget * 0.8) {
        paceStatus = `🎯 Chuẩn nhịp (${actualDailyVelocity} từ/ngày • Độ nhớ ${Math.round(empiricalAccuracy * 100)}%)`;
        paceBadgeColor = '#10b981';
      } else {
        paceStatus = `🌱 Cần tăng tốc (${actualDailyVelocity} từ/ngày)`;
        paceBadgeColor = '#f59e0b';
      }
    } else {
      paceStatus = `Tiêu chuẩn (~${effectiveVelocity} từ/ngày)`;
      paceBadgeColor = '#64748b';
    }

    const rawShortTitle = activeGoal.shortTitle || activeGoal.title || 'Mục tiêu';
    const shortGoalTitle = rawShortTitle.replace(/^Trình độ\s+/i, '').trim();

    const result = {
      levels,
      currentLevel: {
        id: currentLevelId,
        name: levels[currentLevelId]?.name || 'Căn Bản',
        fullTitle: levels[currentLevelId]?.fullTitle || '',
        color: levels[currentLevelId]?.color || '#10b981',
        progressPct: currentLevelProgress,
        learned: levels[currentLevelId]?.learned || 0,
        total: levels[currentLevelId]?.total || 458,
        nextLevelId
      },
      goal: {
        id: activeGoal.id,
        title: activeGoal.title,
        shortTitle: shortGoalTitle,
        icon: activeGoal.icon || '🎯',
        badge: activeGoal.badge || '🎯 CEFR',
        color: activeGoal.color || '#6366f1',
        targetWords,
        learnedWords: learnedGoalWords,
        matureMasteredWords,
        unmasteredWords,
        inLearningWords,
        masteryPct: goalMasteryPct,
        remainingWords: remainingWordsToGoal,
        completionPct: goalCompletionPct,
        remainingNeededPos
      },
      forecast: {
        etaDays,
        targetDateFormatted,
        effectiveVelocity,
        actualDailyVelocity,
        empiricalAccuracy: Math.round(empiricalAccuracy * 100),
        expectedRepsPerWord,
        daysToAcquireAllNew,
        consolidationBuffer,
        isUsingRealBehavior,
        paceStatus,
        paceBadgeColor,
        shortGoalTitle
      }
    };

    if (StatsManager._cefrRoadmapCache.size > 20) {
      StatsManager._cefrRoadmapCache.clear();
    }
    StatsManager._cefrRoadmapCache.set(cacheKey, result);

    return result;
  }



  /**
   * Tính toán trạng thái 3 Nhiệm Vụ Nhỏ Hôm Nay (Daily 3-Step Micro-Quests)
   */
  static getDailyMicroQuests(allLogs = [], studyQueue = {}, dailyNewGoal = 10) {
    const todayKey = getLocalDateKey();
    const todayLogs = allLogs.filter(l => l.timestamp && getLocalDateKey(l.timestamp) === todayKey);

    const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : 0;

    // 1. Nhiệm vụ 1 (Warmup): Ôn tập từ cũ (đã ôn >= 5 từ hoặc sạch hàng đợi ôn)
    const reviewCountToday = todayLogs.filter(l => l.oldState !== State.New && l.oldState !== 0).length;
    const isWarmupDone = reviewCountToday >= 5 || (queueDue === 0 && reviewCountToday > 0) || (queueDue === 0 && todayLogs.length > 0);

    // 2. Nhiệm vụ 2 (Learn): Nạp từ mới hôm nay (>= dailyNewGoal hoặc đạt chỉ tiêu)
    const newCountToday = todayLogs.filter(l => 
      l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
    ).length;
    const isLearnDone = newCountToday >= dailyNewGoal || (newCountToday > 0 && newCountToday >= (studyQueue.totalNew || 0));

    // 3. Nhiệm vụ 3 (Quiz): Làm ít nhất 1 bài trắc nghiệm FSRS
    const isQuizDone = todayLogs.some(l => l.isQuiz === true);

    const quests = [
      {
        id: 'warmup',
        title: 'Khởi động: Ôn 5 từ cũ',
        sub: queueDue > 0 ? `Còn ${queueDue} từ cần ôn` : 'Đã sạch hàng đợi ✓',
        icon: '🥪',
        done: isWarmupDone,
        progressText: `${Math.min(5, reviewCountToday)}/5 từ`
      },
      {
        id: 'learn',
        title: `Nạp mới: ${dailyNewGoal} từ vựng`,
        sub: newCountToday >= dailyNewGoal ? 'Đạt chỉ tiêu ngày ✓' : `Còn ${Math.max(0, dailyNewGoal - newCountToday)} từ nữa`,
        icon: '🥗',
        done: isLearnDone,
        progressText: `${newCountToday}/${dailyNewGoal} từ`
      },
      {
        id: 'quiz',
        title: 'Phản xạ: 1 bài Trắc nghiệm',
        sub: isQuizDone ? 'Đã hoàn thành xuất sắc ✓' : 'Luyện phản xạ nhanh 10 câu',
        icon: '🍎',
        done: isQuizDone,
        progressText: isQuizDone ? '1/1 bài' : '0/1 bài'
      }
    ];

    const completedQuestsCount = quests.filter(q => q.done).length;
    const isAllCompleted = completedQuestsCount === 3;

    return {
      quests,
      completedCount: completedQuestsCount,
      totalQuests: 3,
      isAllCompleted,
      progressPercent: Math.round((completedQuestsCount / 3) * 100)
    };
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

// StudyTimeTracker & BehavioralOptimizer đã được module hóa sang ./timer.js và ./optimizer.js
