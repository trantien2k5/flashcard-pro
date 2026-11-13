/**
 * Overall FSRS Stats Aggregator
 */

import { StorageManager } from "../../services/storage.js";
import { State } from "../fsrs.js";
import { MASTERY_STABILITY_THRESHOLD } from "../../config.js";
import { calculateStreak } from "./streak-analytics.js";
import { getWeeklyProgress, get7DaysForecast } from "./journal.js";

/**
 * Tính toán toàn bộ chỉ số thống kê tổng hợp.
 */
export function getOverallStats(allCards = []) {
  const cardStates = StorageManager.getAllCardStates();
  const logs = StorageManager.getStudyLogs();

  const totalCards = allCards.length;
  let newCardsCount = 0;
  let learningCardsCount = 0;
  let reviewCardsCount = 0;
  let masteredCardsCount = 0;
  let totalStability = 0;
  let totalDifficulty = 0;
  let ratedCardsCount = 0;

  const stabilityBuckets = {
    short: 0,
    medium: 0,
    long: 0,
    mature: 0,
  };

  const difficultyBuckets = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  let learnedCards = 0;
  let goodMemoryCount = 0;

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (!state || state.state === State.New || state.state === 0) {
      newCardsCount++;
    } else {
      learnedCards++;
      if (
        state.state === State.Learning ||
        state.state === State.Relearning
      ) {
        learningCardsCount++;
      } else if (state.state === State.Review) {
        reviewCardsCount++;
        if (state.stability >= MASTERY_STABILITY_THRESHOLD) {
          masteredCardsCount++;
        }
      }

      if (state.stability > 0) {
        totalStability += state.stability;
        totalDifficulty += state.difficulty || 5;
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

  const retentionRate =
    learnedCards > 0
      ? Math.round((goodMemoryCount / learnedCards) * 100)
      : 100;

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
    streak: calculateStreak(logs),
    avgStability:
      ratedCardsCount > 0 ? (totalStability / ratedCardsCount).toFixed(1) : "0",
    avgDifficulty:
      ratedCardsCount > 0 ? (totalDifficulty / ratedCardsCount).toFixed(1) : "0",
    stabilityBuckets,
    difficultyBuckets,
    weeklyActivity: getWeeklyProgress(logs),
    forecast7Days: get7DaysForecast(cardStates),
  };
}

