/**
 * Review View - 5-Column Memory Chart & Smart CTA Dashboard
 */

import { StorageManager } from '../services/storage.js';
import { State } from '../core/fsrs.js';
import { getLocalDateKey } from '../utils.js';
import { showToast } from './components.js';

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-hero-greeting')) {
    container.innerHTML = `
      <!-- Top Hero Greeting Banner -->
      <div class="review-hero-greeting">
        <span class="greeting-badge">Lặp lại ngắt quãng FSRS-6</span>
        <h2 class="greeting-title" id="home-greeting-title">Chào bạn!</h2>
        <p class="greeting-subtitle">Duy trì thói quen học tập và củng cố trí nhớ dài hạn</p>
      </div>

      <!-- 2 Symmetrical Balanced Dashboard Cards -->
      <div class="review-dashboard-layout">
        <!-- Left Card: Tiến Trình & Phiên Ôn Tập Hôm Nay -->
        <div class="review-action-card">
          <div class="review-card-header">
            <div class="review-card-title-group">
              <span class="review-card-title">Tiến trình hôm nay</span>
              <span class="review-card-subtitle" id="home-today-summary">0 từ cần ôn · Mục tiêu 10 từ</span>
            </div>
          </div>

          <!-- Bộ 2 Thẻ Card Thống Kê Tổng Quan Trang Chủ -->
          <div class="home-stats-grid">
            <div class="home-stat-card" id="card-home-goal" title="Mục tiêu học hôm nay">
              <div class="home-stat-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div class="home-stat-info">
                <span class="home-stat-val" id="home-goal-count">0/10</span>
                <span class="home-stat-lbl">Mục tiêu ngày</span>
              </div>
            </div>

            <div class="home-stat-card" id="card-home-due" title="Từ vựng đến hạn ôn tập">
              <div class="home-stat-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="home-stat-info">
                <span class="home-stat-val" id="home-due-count">0</span>
                <span class="home-stat-lbl">Cần ôn tập</span>
              </div>
            </div>
          </div>

          <!-- Nút Hành Động Ôn Tập Chính -->
          <div class="home-cta-wrapper">
            <button class="btn-primary-hero btn-home-cta" id="btn-home-cta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span id="home-cta-text">Bắt đầu ôn tập</span>
            </button>
          </div>
        </div>

        <!-- Right Card: 5 Cột Biểu Đồ Cấp Độ Trí Nhớ FSRS -->
        <div class="memory-chart-card">
          <div class="memory-chart-header">
            <div class="memory-chart-title-wrap">
              <span class="memory-chart-title">Phân bố độ bền trí nhớ</span>
              <span class="memory-chart-subtitle">5 cấp độ ghi nhớ theo thuật toán FSRS</span>
            </div>
            <span class="memory-chart-badge" id="memory-total-badge">0 từ</span>
          </div>

          <!-- 5 Cột biểu đồ -->
          <div class="memory-bars-container" id="home-memory-bars"></div>

          <!-- Gợi ý khi chưa có từ nào trong kho -->
          <div class="memory-chart-hint" id="memory-chart-hint">
            <span>Hoàn thành bài học đầu tiên để theo dõi tiến trình ghi nhớ</span>
          </div>
        </div>
      </div>
    `;
  }
}

export function renderReviewTab(app) {
  try {
    const container = document.getElementById('tab-review') || document.getElementById('tab-home');
    if (!container) return;
    renderReviewShell(container);

    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();

    // Lọc chỉ lấy các từ ĐÃ HỌC (đã từng review và có stability > 0)
    const learnedCards = allCards.filter(card => {
      const s = cardStates[card.id];
      return s && s.state !== State.New && s.state !== 0 && s.stability && s.stability > 0;
    });
    const totalLearned = learnedCards.length;

    // 5 mức độ trí nhớ theo Độ bền FSRS (Stability S & Chu kỳ ôn tập):
    const levels = [
      {
        id: 'lvl-1',
        tag: 'Mức 1',
        name: 'Mới học',
        interval: '< 3 ngày',
        desc: 'Độ bền trí nhớ dưới 3 ngày (giai đoạn khởi đầu)',
        iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 18v4"/><path d="M12 2v3"/></svg>`,
        color: '#ef4444',
        gradient: 'linear-gradient(180deg, #f87171, #dc2626)',
        trackBg: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        badgeBg: 'rgba(239, 68, 68, 0.14)',
        glow: '0 4px 14px rgba(239, 68, 68, 0.4)',
        count: 0
      },
      {
        id: 'lvl-2',
        tag: 'Mức 2',
        name: 'Ngắn hạn',
        interval: '3 – 7 ngày',
        desc: 'Độ bền 3 đến 7 ngày (đang củng cố)',
        iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/></svg>`,
        color: '#f97316',
        gradient: 'linear-gradient(180deg, #fb923c, #ea580c)',
        trackBg: 'rgba(249, 115, 22, 0.12)',
        borderColor: 'rgba(249, 115, 22, 0.35)',
        badgeBg: 'rgba(249, 115, 22, 0.14)',
        glow: '0 4px 14px rgba(249, 115, 22, 0.4)',
        count: 0
      },
      {
        id: 'lvl-3',
        tag: 'Mức 3',
        name: 'Trung hạn',
        interval: '1 – 2 tuần',
        desc: 'Độ bền 7 đến 14 ngày (trí nhớ ổn định)',
        iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/></svg>`,
        color: '#f59e0b',
        gradient: 'linear-gradient(180deg, #fbbf24, #d97706)',
        trackBg: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        badgeBg: 'rgba(245, 158, 11, 0.14)',
        glow: '0 4px 14px rgba(245, 158, 11, 0.4)',
        count: 0
      },
      {
        id: 'lvl-4',
        tag: 'Mức 4',
        name: 'Bền vững',
        interval: '2 – 4 tuần',
        desc: 'Độ bền 14 đến 30 ngày (trí nhớ bền vững)',
        iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        color: '#10b981',
        gradient: 'linear-gradient(180deg, #34d399, #059669)',
        trackBg: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        badgeBg: 'rgba(16, 185, 129, 0.14)',
        glow: '0 4px 14px rgba(16, 185, 129, 0.4)',
        count: 0
      },
      {
        id: 'lvl-5',
        tag: 'Mức 5',
        name: 'Ghi nhớ sâu',
        interval: '≥ 30 ngày',
        desc: 'Độ bền từ 30 ngày trở lên (trí nhớ vĩnh viễn)',
        iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        color: '#6366f1',
        gradient: 'linear-gradient(180deg, #818cf8, #4f46e5)',
        trackBg: 'rgba(99, 102, 241, 0.12)',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        badgeBg: 'rgba(99, 102, 241, 0.14)',
        glow: '0 4px 14px rgba(99, 102, 241, 0.4)',
        count: 0
      }
    ];

    // Phân loại từ theo 5 mức Stability
    for (const card of learnedCards) {
      const s = cardStates[card.id]?.stability || 0;
      if (s < 3) levels[0].count++;
      else if (s < 7) levels[1].count++;
      else if (s < 14) levels[2].count++;
      else if (s < 30) levels[3].count++;
      else levels[4].count++;
    }

    // 1. Cập nhật Tiêu đề & Tổng số từ trong Kho trí nhớ
    const countBadge = document.getElementById('memory-total-badge') || document.getElementById('memory-tier-total-count');
    if (countBadge) {
      countBadge.textContent = `${totalLearned.toLocaleString('vi-VN')} từ`;
    }

    // 2. Render Biểu đồ 5 Cột Trí Nhớ
    const chartContainer = document.getElementById('home-memory-bars') || document.getElementById('memory-tier-chart');
    const hintEl = document.getElementById('memory-chart-hint');

    if (chartContainer) {
      chartContainer.innerHTML = '';
      
      const maxCount = Math.max(...levels.map(l => l.count));

      levels.forEach(lvl => {
        const percent = totalLearned > 0 ? Math.round((lvl.count / totalLearned) * 100) : 0;
        
        let colHeightPercent = 0;
        if (lvl.count > 0 && maxCount > 0) {
          colHeightPercent = Math.min(100, Math.max(16, Math.round((lvl.count / maxCount) * 100)));
        }

        const col = document.createElement('div');
        col.className = `memory-col ${lvl.count === 0 ? 'empty-tier' : ''}`;
        col.title = `${lvl.tag}: ${lvl.name} (${lvl.interval})\n${lvl.count} từ (${percent}%) - ${lvl.desc}`;

        col.innerHTML = `
          <!-- Cột hiển thị tỉ lệ -->
          <div class="memory-track-wrap">
            <div class="memory-col-track" style="background: ${lvl.trackBg}; border-color: ${lvl.borderColor};">
              <div class="memory-col-fill" style="height: ${colHeightPercent}%; background: ${lvl.gradient}; box-shadow: ${lvl.glow};"></div>
            </div>
          </div>

          <!-- Biểu tượng mức trí nhớ -->
          <div class="memory-icon-badge" style="background: ${lvl.badgeBg}; color: ${lvl.color};">
            ${lvl.iconSvg}
          </div>

          <!-- Tên mức & Chu kỳ ôn -->
          <span class="memory-col-name">${lvl.name}</span>
          <span class="memory-col-interval">${lvl.interval}</span>

          <!-- Số lượng từ -->
          <span class="memory-col-val" style="color: ${lvl.color};">${lvl.count}</span>
        `;
        chartContainer.appendChild(col);
      });

      if (hintEl) {
        hintEl.style.display = totalLearned === 0 ? 'flex' : 'none';
      }
    }

    // 3. Cập nhật Trạng thái Thẻ Hành Động Ôn Tập Hôm Nay
    const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
    const dueCount = studyQueue.totalDue || 0;
    const newCount = studyQueue.totalNew || 0;
    const todayLogs = StorageManager.getStudyLogs().filter(l => 
      l.timestamp && getLocalDateKey(l.timestamp) === getLocalDateKey()
    );

    const elSummary = document.getElementById('home-today-summary');
    const elGoalCount = document.getElementById('home-goal-count');
    const elDueCount = document.getElementById('home-due-count');
    const btnCta = document.getElementById('btn-home-cta') || document.getElementById('btn-home-start-review');
    const ctaIcon = document.getElementById('home-cta-icon');
    const ctaText = document.getElementById('home-cta-text');

    const dailyGoal = app.settings.dailyNewLimit || 10;
    const todayLearned = todayLogs.length;

    if (elSummary) {
      if (dueCount > 0) {
        elSummary.textContent = `${dueCount} từ cần ôn tập lại ngay hôm nay`;
      } else if (newCount > 0) {
        elSummary.textContent = `Không có từ đến hạn · Sẵn sàng học ${newCount} từ mới`;
      } else {
        elSummary.textContent = `Tuyệt vời! Bạn đã hoàn thành tất cả mục tiêu hôm nay`;
      }
    }

    if (elGoalCount) {
      elGoalCount.textContent = `${todayLearned}/${dailyGoal}`;
    }

    if (elDueCount) {
      elDueCount.textContent = dueCount;
    }

    if (btnCta) {
      if (dueCount > 0) {
        if (ctaText) ctaText.textContent = 'Ôn tập ngay';
        else btnCta.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Ôn tập ngay</span>`;
      } else if (newCount > 0) {
        if (ctaText) ctaText.textContent = 'Học từ mới';
        else btnCta.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Học từ mới</span>`;
      } else {
        if (ctaText) ctaText.textContent = 'Ôn tập tăng cường';
        else btnCta.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Ôn tập tăng cường</span>`;
      }

      btnCta.onclick = () => {
        try {
          app.startStudySession(null, null);
        } catch (err) {
          console.error('Lỗi khởi động phiên học:', err);
          showToast('Không thể bắt đầu phiên học: ' + err.message, 'error');
        }
      };
    }

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}
