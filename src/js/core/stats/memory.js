/**
 * FSRS-6 Cognitive Memory Intelligence & Stability Tier Analyzer
 */

import { StorageManager } from "../../services/storage.js";
import { State, Rating, FSRS } from "../fsrs.js";
import { calculateStreak } from "./streak-analytics.js";

/**
 * Phân tích chuyên sâu Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6.
 */
export function getMemoryIntelligence(allCards = []) {
  const cardStates = StorageManager.getAllCardStates() || {};
  const logs = StorageManager.getStudyLogs() || [];
  const now = new Date();
  const fsrs = new FSRS();

  let totalLearned = 0;
  let totalRetrievability = 0;
  let totalStability = 0;
  let totalDifficulty = 0;
  let ratedCount = 0;

  const tiers = {
    tier5: {
      id: "tier5",
      count: 0,
      label: "Nhớ sâu vĩnh viễn",
      desc: "Độ bền ≥ 30 ngày (Chu kỳ ôn 1 - 6 tháng)",
      icon: "💎",
      color: "#10b981",
      lightColor: "#059669",
    },
    tier4: {
      id: "tier4",
      count: 0,
      label: "Ghi nhớ bền vững",
      desc: "Độ bền 14 - 30 ngày (Chu kỳ ôn 2 - 4 tuần)",
      icon: "🛡️",
      color: "#06b6d4",
      lightColor: "#0891b2",
    },
    tier3: {
      id: "tier3",
      count: 0,
      label: "Ghi nhớ trung hạn",
      desc: "Độ bền 7 - 14 ngày (Chu kỳ ôn 1 - 2 tuần)",
      icon: "🌳",
      color: "#3b82f6",
      lightColor: "#2563eb",
    },
    tier2: {
      id: "tier2",
      count: 0,
      label: "Trí nhớ ngắn hạn",
      desc: "Độ bền 3 - 7 ngày (Chu kỳ ôn 3 - 7 ngày)",
      icon: "🌿",
      color: "#f59e0b",
      lightColor: "#d97706",
    },
    tier1: {
      id: "tier1",
      count: 0,
      label: "Mới nạp vào não",
      desc: "Độ bền < 3 ngày (Cần củng cố hàng ngày)",
      icon: "🌱",
      color: "#a855f7",
      lightColor: "#7c3aed",
    },
  };

  let lapsedCardsCount = 0;
  let recoveredCardsCount = 0;
  let leechCount = 0;
  let suspendedCount = 0;

  const states = Object.values(cardStates);
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state && state.suspended === true) suspendedCount++;
    if (
      state &&
      (state.isLeech === true || (state.lapses && state.lapses >= 8))
    ) {
      leechCount++;
    }
    if (!state || state.state === State.New || state.state === 0) continue;

    totalLearned++;
    const s = Number(state.stability) || 0;
    const d = Number(state.difficulty) || 5;

    if (s > 0) {
      totalStability += s;
      totalDifficulty += d;
      ratedCount++;
      totalRetrievability += fsrs.getRetrievability(state, now);

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
      if (s >= 3) recoveredCardsCount++;
    }
  }

  const currentRetrievability =
    ratedCount > 0 ? Math.round((totalRetrievability / ratedCount) * 100) : 0;
  const avgStability =
    ratedCount > 0 ? (totalStability / ratedCount).toFixed(1) : "0";
  const avgDifficulty =
    ratedCount > 0 ? (totalDifficulty / ratedCount).toFixed(1) : "5.0";

  const ratingCounts = {
    [Rating.Again]: 0,
    [Rating.Hard]: 0,
    [Rating.Good]: 0,
    [Rating.Easy]: 0,
  };
  let totalRatings = 0;

  for (let i = 0; i < logs.length; i++) {
    const r = logs[i].rating;
    if (ratingCounts[r] !== undefined) {
      ratingCounts[r]++;
      totalRatings++;
    }
  }

  const pct = (count) =>
    totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

  const ratingPct = {
    again: pct(ratingCounts[Rating.Again]),
    hard: pct(ratingCounts[Rating.Hard]),
    good: pct(ratingCounts[Rating.Good]),
    easy: pct(ratingCounts[Rating.Easy]),
  };

  const firstTryAccuracy =
    totalRatings > 0
      ? Math.round(
          ((ratingCounts[Rating.Good] + ratingCounts[Rating.Easy]) /
            totalRatings) *
            100,
        )
      : 0;

  const recoveryRate =
    lapsedCardsCount > 0
      ? Math.round((recoveredCardsCount / lapsedCardsCount) * 100)
      : totalLearned > 0
        ? 100
        : 0;

  const deepMastered = tiers.tier5.count;
  const solidMastered = tiers.tier4.count;
  const streak = calculateStreak(logs);

  let score = Math.round(
    Math.min(
      500,
      deepMastered * 2.5 +
        solidMastered * 1.5 +
        (totalLearned - deepMastered - solidMastered) * 0.5,
    ) +
      (currentRetrievability / 100) * 300 +
      Math.min(200, streak * 15 + Math.min(50, totalLearned * 0.1)),
  );
  score = Math.max(0, Math.min(1000, score));

  let rank = {
    title: "🌱 Khởi Động",
    level: 1,
    color: "#8b5cf6",
    badge: "Tập Sự",
  };
  if (score >= 850) {
    rank = {
      title: "👑 Bậc Thầy Trí Nhớ",
      level: 5,
      color: "#10b981",
      badge: "Grandmaster",
    };
  } else if (score >= 600) {
    rank = {
      title: "🏆 Tinh Anh FSRS",
      level: 4,
      color: "#06b6d4",
      badge: "Master",
    };
  } else if (score >= 350) {
    rank = {
      title: "⭐ Trí Nhớ Bền Bỉ",
      level: 3,
      color: "#3b82f6",
      badge: "Expert",
    };
  } else if (score >= 150) {
    rank = {
      title: "🌿 Đang Bứt Phá",
      level: 2,
      color: "#f59e0b",
      badge: "Pro",
    };
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
    streak,
  };
}
