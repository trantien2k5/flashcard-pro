/**
 * Profile View - User stats, Topics overview, Achievements & Pure Local Data Management
 */

import { StorageManager } from '../storage.js';
import { StatsManager } from '../stats.js';
import { State } from '../fsrs.js';

export async function renderProfileTab(app) {
  try {
    const allDecks = app.deckManager.getAllDecks();
    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();
    const logs = StorageManager.getStudyLogs();

    // 1. Cập nhật Kho kiến thức (Chủ đề lớn, Chủ đề con, Từ vựng)
    const totalTopics = allDecks.length;
    const totalSubtopics = allDecks.reduce((sum, d) => sum + ((d.subtopics && d.subtopics.length) ? d.subtopics.length : (d.subcategories && d.subcategories.length ? d.subcategories.length : 1)), 0);
    const totalWords = allCards.length;

    const topicsEl = document.getElementById('tax-topics-count');
    if (topicsEl) topicsEl.textContent = totalTopics;

    const subtopicsEl = document.getElementById('tax-subtopics-count');
    if (subtopicsEl) subtopicsEl.textContent = totalSubtopics;

    const wordsEl = document.getElementById('tax-words-count');
    if (wordsEl) wordsEl.textContent = totalWords.toLocaleString('vi-VN');

    // 2. Cập nhật Thành tích học tập cá nhân
    const learnedCards = allCards.filter(card => {
      const s = cardStates[card.id];
      return s && s.state !== State.New && s.state !== 0 && s.stability && s.stability > 0;
    });
    const achieveLearnedEl = document.getElementById('profile-achieve-learned');
    if (achieveLearnedEl) achieveLearnedEl.textContent = learnedCards.length;

    const streak = StatsManager.calculateStreak(logs);
    const achieveStreakEl = document.getElementById('profile-achieve-streak');
    if (achieveStreakEl) achieveStreakEl.textContent = `${streak} 🔥`;

    // Tổng thời gian học (tích lũy tất cả các ngày)
    const timeMap = typeof StorageManager.getStudyTimeMap === 'function' ? StorageManager.getStudyTimeMap() : {};
    const totalSeconds = Object.values(timeMap).reduce((sum, s) => sum + (Number(s) || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const achieveTimeEl = document.getElementById('profile-achieve-time');
    if (achieveTimeEl) {
      if (totalMinutes < 1) {
        achieveTimeEl.textContent = totalSeconds > 0 ? '< 1 ph' : '0 ph';
      } else {
        achieveTimeEl.textContent = `${totalMinutes} ph`;
      }
    }
  } catch (err) {
    console.error('Lỗi trong renderProfileTab:', err);
  }
}
