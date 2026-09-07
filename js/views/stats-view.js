/**
 * Stats View - Visual Analytics: 
 * 1. Tổng quan (Từ đã học, Đang nhớ tốt, Tỷ lệ ghi nhớ)
 * 2. Tiến bộ 7 ngày (Số từ ghi nhớ được tích lũy)
 * 3. Độ bền trí nhớ (Mới học → Đang củng cố → Nhớ trung hạn → Nhớ dài hạn)
 * 4. Dự báo ôn tập 7 ngày tới
 */

import { StatsManager } from '../stats.js';

export function renderStatsTab(app) {
  try {
    const allCards = app.deckManager.getAllCards();
    const stats = StatsManager.getOverallStats(allCards);

    // 1. Tổng quan (Overview Metrics)
    const elLearned = document.getElementById('stat-overview-learned');
    const elGood = document.getElementById('stat-overview-good');
    const elRetention = document.getElementById('stat-overview-retention');
    const elRetentionSub = document.getElementById('stat-overview-retention-sub');

    if (elLearned) elLearned.textContent = stats.learnedCards;
    if (elGood) elGood.textContent = stats.goodMemoryCount;
    if (elRetention) elRetention.textContent = `${stats.retentionRate}%`;
    if (elRetentionSub) {
      if (stats.learnedCards === 0) {
        elRetentionSub.textContent = 'Chưa có từ';
      } else if (stats.retentionRate >= 80) {
        elRetentionSub.textContent = 'Rất tốt ⭐';
      } else if (stats.retentionRate >= 60) {
        elRetentionSub.textContent = 'Đạt chuẩn ✨';
      } else {
        elRetentionSub.textContent = 'Cần củng cố ⚡';
      }
    }

    // 2. Tiến bộ 7 ngày (Số từ ghi nhớ được)
    const weeklyChart = document.getElementById('weekly-chart');
    if (weeklyChart) {
      weeklyChart.innerHTML = '';
      const maxCount = Math.max(1, ...stats.weeklyActivity.map(a => a.count));
      stats.weeklyActivity.forEach(day => {
        const percent = day.count === 0 ? 0 : Math.min(100, Math.max(12, (day.count / maxCount) * 100));
        const col = document.createElement('div');
        col.className = `bar-col ${day.isToday ? 'is-today' : ''}`;
        col.innerHTML = `
          <span class="bar-count-label ${day.count > 0 ? 'has-data' : ''}">${day.count}</span>
          <div class="bar-col-track">
            <div class="bar-fill ${day.isToday ? 'bar-today' : ''}" style="height: ${percent}%;"></div>
          </div>
          <span class="bar-day-label ${day.isToday ? 'label-today' : ''}" title="${day.isToday ? 'Hôm nay' : day.date}">${day.dayName}</span>
        `;
        weeklyChart.appendChild(col);
      });
    }

    // 3. Độ bền trí nhớ (Mới học → Đang củng cố → Nhớ trung hạn → Nhớ dài hạn)
    const stabilityMatrix = document.getElementById('stability-matrix');
    const durabilityTotalBadge = document.getElementById('durability-total-badge');
    if (durabilityTotalBadge) {
      durabilityTotalBadge.textContent = `${stats.learnedCards} từ`;
    }

    if (stabilityMatrix) {
      const b = stats.stabilityBuckets;
      const total = Math.max(1, stats.learnedCards);
      const pctMature = stats.learnedCards > 0 ? Math.round((b.mature / total) * 100) : 0;
      const pctLong = stats.learnedCards > 0 ? Math.round((b.long / total) * 100) : 0;
      const pctMedium = stats.learnedCards > 0 ? Math.round((b.medium / total) * 100) : 0;
      const pctShort = stats.learnedCards > 0 ? Math.round((b.short / total) * 100) : 0;

      stabilityMatrix.innerHTML = `
        <div class="matrix-item">
          <div class="matrix-item-header">
            <span class="matrix-label">💎 Nhớ dài hạn <span class="matrix-sub">(> 30 ngày)</span></span>
            <span class="matrix-val">${b.mature} từ <span class="matrix-pct">(${pctMature}%)</span></span>
          </div>
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${pctMature}%; background: #10b981;"></div>
          </div>
        </div>
        <div class="matrix-item">
          <div class="matrix-item-header">
            <span class="matrix-label">🔋 Nhớ trung hạn <span class="matrix-sub">(14 - 30 ngày)</span></span>
            <span class="matrix-val">${b.long} từ <span class="matrix-pct">(${pctLong}%)</span></span>
          </div>
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${pctLong}%; background: #3b82f6;"></div>
          </div>
        </div>
        <div class="matrix-item">
          <div class="matrix-item-header">
            <span class="matrix-label">⚡ Đang củng cố <span class="matrix-sub">(3 - 14 ngày)</span></span>
            <span class="matrix-val">${b.medium} từ <span class="matrix-pct">(${pctMedium}%)</span></span>
          </div>
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${pctMedium}%; background: #f59e0b;"></div>
          </div>
        </div>
        <div class="matrix-item">
          <div class="matrix-item-header">
            <span class="matrix-label">🌱 Mới học <span class="matrix-sub">(< 3 ngày)</span></span>
            <span class="matrix-val">${b.short} từ <span class="matrix-pct">(${pctShort}%)</span></span>
          </div>
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${pctShort}%; background: #8b5cf6;"></div>
          </div>
        </div>
      `;
    }

    // 4. Dự báo ôn tập 7 ngày tới
    const forecastList = document.getElementById('forecast-list');
    if (forecastList) {
      forecastList.innerHTML = '';
      stats.forecast7Days.forEach(fc => {
        const item = document.createElement('div');
        item.className = `matrix-item forecast-item ${fc.count > 0 ? 'has-due' : ''}`;
        item.innerHTML = `
          <div class="matrix-item-header">
            <span class="forecast-day-name">${fc.label}</span>
            <span class="forecast-count-badge ${fc.count > 0 ? 'badge-due' : 'badge-empty'}">${fc.count} từ đến hạn</span>
          </div>
        `;
        forecastList.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Lỗi renderStatsTab:', err);
  }
}
