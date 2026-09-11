/**
 * Stats & Analytics Manager + Active Study Timer for FSRS-6 English Learning
 */

import { StorageManager } from '../services/storage.js';
import { State, Rating } from './fsrs.js';
import { getLocalDateKey } from '../utils.js';

export class StatsManager {
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
      const state = cardStates[card.id];
      if (!state || state.state === State.New || state.state === 0) {
        newCardsCount++;
      } else {
        learnedCards++;
        if (state.state === State.Learning || state.state === State.Relearning) {
          learningCardsCount++;
        } else if (state.state === State.Review) {
          reviewCardsCount++;
          if (state.stability >= 21) {
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
        if (diffMs >= 0 && diffMs < sevenDaysMs) {
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
    const dailyMap = Object.create(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyMap[dateKey] = {
        dateKey,
        day: d,
        wordsLearned: new Set(),
        wordsReviewed: new Set(),
        memorizedWords: new Set(),
        goodReviews: 0,
        totalReviews: 0,
        studySeconds: 0,
        isToday: isCurrentMonth && d === currentDay,
        isFuture: isCurrentMonth ? d > currentDay : (new Date(year, month - 1, d) > today)
      };
    }

    // Nạp thời gian học theo ngày
    try {
      const timeLogs = JSON.parse(localStorage.getItem('fc_pro_study_time_logs') || '{}');
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
          if (log.state === State.New || log.state === 0 || log.isNew) {
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
        }
      }
    }

    // Tổng hợp danh sách ngày trong tháng
    const days = [];
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
   */
  static getYearlyJournalData(year) {
    const months = [];
    let yearTotalWords = 0;
    let yearActiveDays = 0;
    let yearTotalMinutes = 0;

    for (let m = 1; m <= 12; m++) {
      const data = this.getMonthJournalData(year, m);
      yearTotalWords += data.monthTotalWords;
      yearActiveDays += data.activeDaysCount;
      yearTotalMinutes += data.monthTotalMinutes;
      months.push(data);
    }

    return {
      year,
      months,
      yearTotalWords,
      yearActiveDays,
      yearTotalMinutes
    };
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
