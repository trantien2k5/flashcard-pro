/**
 * Stats View - Visual Analytics: 
 * 1. Tổng quan (Từ đã học, Đang nhớ tốt, Tỷ lệ ghi nhớ)
 * 2. Tiến bộ 7 ngày (Số từ ghi nhớ được tích lũy)
 * 3. Độ bền trí nhớ (Mới học → Đang củng cố → Nhớ trung hạn → Nhớ dài hạn)
 * 4. Dự báo ôn tập 7 ngày tới
 */

import { StatsManager } from '../core/stats.js';

export function renderStatsTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = `
      <!-- 1. Top Hero Stats Banner -->
      <div class="stats-hero-banner">
        <div class="stats-hero-left">
          <div class="stats-hero-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <div class="stats-hero-text">
            <h2 class="stats-hero-title">Thống kê học tập</h2>
            <p class="stats-hero-subtitle">Hiệu suất ghi nhớ và chu kỳ lặp lại ngắt quãng FSRS</p>
          </div>
        </div>
        <div class="stats-hero-badges">
          <span class="stats-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">FSRS-6 Analytics</span>
        </div>
      </div>

      <!-- 2. Overview 3-Box Row -->
      <div class="stats-overview-grid">
        <div class="stats-overview-box">
          <div class="stats-box-icon" style="background: rgba(99, 102, 241, 0.12); color: #6366f1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            </svg>
          </div>
          <div class="stats-box-content">
            <span class="stats-overview-label">Đã học</span>
            <span class="stats-overview-val" id="stat-overview-learned">0</span>
            <span class="stats-overview-sub">Tổng từ vựng</span>
          </div>
        </div>

        <div class="stats-overview-box">
          <div class="stats-box-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="stats-box-content">
            <span class="stats-overview-label">Nhớ tốt</span>
            <span class="stats-overview-val" id="stat-overview-good">0</span>
            <span class="stats-overview-sub">Độ bền ≥ 21 ngày</span>
          </div>
        </div>

        <div class="stats-overview-box">
          <div class="stats-box-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div class="stats-box-content">
            <span class="stats-overview-label">Tỷ lệ nhớ</span>
            <span class="stats-overview-val" id="stat-overview-retention">100%</span>
            <span class="stats-overview-sub" id="stat-overview-retention-sub">Mục tiêu 90%</span>
          </div>
        </div>
      </div>

      <!-- 3. Mid Grid & Symmetrical Cards -->
      <div class="stats-card-group">
        <!-- Zone 2: Weekly Progress Chart -->
        <div class="stats-card">
          <div class="stats-card-title">
            <div class="stats-card-title-left">
              <span>Tiến độ 7 ngày qua</span>
            </div>
            <span class="stats-card-badge">7 ngày gần nhất</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 8px;">Số từ vựng đã ôn tập thành công mỗi ngày</p>
          <div class="activity-bar-chart" id="weekly-chart"></div>
        </div>

        <!-- Zone 3: Memory Durability (Stability Tiers) -->
        <div class="stats-card">
          <div class="stats-card-title">
            <div class="stats-card-title-left">
              <span>Phân bố độ bền trí nhớ</span>
            </div>
            <span class="stats-card-badge" id="durability-total-badge">0 từ</span>
          </div>
          <div class="matrix-row" id="stability-matrix"></div>
        </div>

        <!-- Zone 4: 7-Day Forecast Chart -->
        <div class="stats-card stats-card-full">
          <div class="stats-card-title">
            <div class="stats-card-title-left">
              <span>Dự báo lịch ôn tập 7 ngày tới</span>
            </div>
            <span class="stats-card-badge">Lặp lại ngắt quãng</span>
          </div>
          <div class="forecast-grid" id="forecast-chart"></div>
        </div>
      </div>
    `;
  }
}

export function renderStatsTab(app) {
  try {
    const container = document.getElementById('tab-stats');
    if (!container) return;
    renderStatsTabShell(container);

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
      const buckets = stats.stabilityBuckets;
      const matrixItems = [
        { label: 'Mới học (< 3 ngày)', count: buckets.short, color: '#ef4444' },
        { label: 'Củng cố (3 – 14 ngày)', count: buckets.medium, color: '#f59e0b' },
        { label: 'Bền vững (14 – 30 ngày)', count: buckets.long, color: '#10b981' },
        { label: 'Dài hạn (> 30 ngày)', count: buckets.mature, color: '#6366f1' }
      ];

      stabilityMatrix.innerHTML = matrixItems.map(item => {
        const percent = stats.learnedCards > 0 ? Math.round((item.count / stats.learnedCards) * 100) : 0;
        return `
          <div class="matrix-item">
            <div class="matrix-item-header">
              <span class="matrix-label">${item.label}</span>
              <span class="matrix-val">${item.count} từ <span class="matrix-pct">(${percent}%)</span></span>
            </div>
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${percent}%; background: ${item.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Dự báo ôn tập 7 ngày tới
    const forecastContainer = document.getElementById('forecast-chart');
    if (forecastContainer) {
      forecastContainer.innerHTML = '';
      stats.forecast7Days.forEach(day => {
        const item = document.createElement('div');
        item.className = `forecast-item ${day.count > 0 ? 'has-due' : ''}`;
        item.innerHTML = `
          <span class="forecast-day-name">${day.label}</span>
          <span class="forecast-count-badge ${day.count > 0 ? 'badge-due' : 'badge-empty'}">${day.count} từ</span>
        `;
        forecastContainer.appendChild(item);
      });
    }

  } catch (err) {
    console.error('Lỗi khi render Stats Tab:', err);
  }
}
