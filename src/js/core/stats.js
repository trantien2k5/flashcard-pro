/**
 * Stats & Analytics Manager + Active Study Timer Facade for FSRS-6 English Learning
 */

import { StudyTimeTracker, globalStudyTimer } from "./timer.js";
import { BehavioralOptimizer } from "./optimizer.js";
import { getMemoryIntelligence } from "./stats/memory.js";
import { getOverallStats } from "./stats/overview.js";
import {
  calculateStreak,
  detectBrokenStreak,
} from "./stats/streak-analytics.js";
import {
  getComprehensionPower,
  getCefrRoadmapAndForecast,
  getDailyMicroQuests,
} from "./stats/roadmap.js";
import {
  getPrimeStudyHour,
  getWeeklyProgress,
  get7DaysForecast,
  getMonthJournalData,
  getYearJournalData,
  getYearlyJournalData,
} from "./stats/journal.js";

export { StudyTimeTracker, globalStudyTimer, BehavioralOptimizer };

export class StatsManager {
  static getMemoryIntelligence(allCards = []) {
    return getMemoryIntelligence(allCards);
  }

  static getOverallStats(allCards = []) {
    return getOverallStats(allCards);
  }

  static calculateStreak(logs = null, explicitStreakState = null) {
    return calculateStreak(logs, explicitStreakState);
  }

  static detectBrokenStreak(logs = null, explicitStreakState = null) {
    return detectBrokenStreak(logs, explicitStreakState);
  }

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
