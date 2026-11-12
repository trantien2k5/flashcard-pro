/**
 * Stats Submodule: CEFR Roadmap, Comprehension Power & Daily Micro Quests
 */

import { StorageManager } from '../../services/storage.js';
import { State, Rating } from '../fsrs.js';
import { getLearningGoal } from '../../config.js';
import { getLocalDateKey, normalizePos } from '../../utils.js';

let _cefrRoadmapCache = new Map();

export function getComprehensionPower(learnedCount = 0) {
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
export function getCefrRoadmapAndForecast(allCards = [], settings = {}) {
  const cardStates = StorageManager.getAllCardStates() || {};
  const logs = StorageManager.getStudyLogs() || [];
  const now = new Date();
  const rolloverHour = Number(settings.rolloverHour) || 0;

  const activeGoalId = settings.activeGoal?.id || 'cefr-b1';
  const activeGoal = getLearningGoal(activeGoalId);
  const targetWords = Number(settings.activeGoal?.targetWords) || activeGoal.defaultTargetWords || 3027;
  const stateRev = StorageManager.getStateRevision ? StorageManager.getStateRevision() : 0;
  const cacheKey = `${activeGoalId}_${targetWords}_${stateRev}_${logs.length}_${rolloverHour}_${allCards.length}`;

  
  if (_cefrRoadmapCache.has(cacheKey)) {
    return _cefrRoadmapCache.get(cacheKey);
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

  if (_cefrRoadmapCache.size > 20) {
    _cefrRoadmapCache.clear();
  }
  _cefrRoadmapCache.set(cacheKey, result);

  return result;
}



/**
 * Tính toán trạng thái 3 Nhiệm Vụ Nhỏ Hôm Nay (Daily 3-Step Micro-Quests)
 */
export function getDailyMicroQuests(allLogs = [], studyQueue = {}, dailyNewGoal = 10) {
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
