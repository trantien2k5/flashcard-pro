/**
 * Stats View - Spaced Repetition FSRS-6 Cognitive Analytics & True Memory Intelligence
 * 1. Đánh giá Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6 (True Retrievability R, Average Stability, Cognitive Score, Rank)
 * 2. Dự Báo Lịch Ôn 7 Ngày (7-Day Forecast Capsules & Lịch tháng chi tiết FSRS)
 * 3. Lịch Học Tập Theo Ngày (Calendar Heatmap Tháng/Năm & Thống kê tích lũy)
 * 4. Tháp 5 Tầng Độ Bền Trí Nhớ (Memory Stability Pyramid)
 * 5. Phân Tích Phản Xạ & Tỉ Lệ Phục Hồi (Recall Quality & Recovery Rate)
 */

import { WORDS } from '../../data/index.js';
import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
import { escapeHTML } from '../utils.js';
import { speak } from '../services/audio.js';
import { openBehavioralOptimizerModal } from './components.js';

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12
let _viewMode = 'month'; // 'month' | 'year'
let _cachedApp = null;
let _calViewingYear = new Date().getFullYear();
let _calViewingMonth = new Date().getMonth(); // 0-indexed
let _calSelectedDate = new Date();

export function renderStatsTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = `
      <div class="stats-bento-container">
        <!-- 1. Top Unboxed Page Header -->
        <div class="stats-hero-banner">
          <div class="stats-hero-left">
            <div class="stats-hero-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div class="stats-hero-text">
              <h2 class="stats-hero-title">Năng Lực & Phân Tích Trí Nhớ</h2>
              <p class="stats-hero-subtitle">Đánh giá trí nhớ thật theo mô hình toán học FSRS-6 chuyên sâu</p>
            </div>
          </div>
          <div class="stats-hero-badges">
            <button type="button" class="btn-open-calendar-modal" id="btn-open-optimizer-from-stats" title="Tối ưu hóa FSRS theo hành vi" style="cursor: pointer; background: var(--primary-light, rgba(99, 102, 241, 0.12)); border: 1px solid var(--border-focus, #6366f1); color: var(--primary, #6366f1); font-weight: 600;">
              <span>🧠 Tối ưu hóa FSRS</span>
            </button>
            <span class="stats-pill-badge stats-rank-pill" id="stats-hero-rank">🌱 Khởi Động</span>
            <span class="stats-pill-badge stats-score-pill" id="stats-hero-score">⚡ 0/1000</span>
          </div>
        </div>

        <!-- Main Responsive Layout -->
        <div class="stats-main-grid">
          <div class="stats-col-main">
            <!-- 2. KHỐI 1: NĂNG LỰC TRÍ NHỚ THẬT (FSRS-6 COGNITIVE CAPACITY) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>
                    </svg>
                    NĂNG LỰC TRÍ NHỚ THẬT
                  </span>
                  <span class="stats-accuracy-pill" id="stats-header-accuracy">🧠 Khả năng nhớ: 0%</span>
                </div>
                <p class="stats-section-hint">Chỉ số toán học FSRS phản ánh trực tiếp khả năng lưu giữ từ vựng trong não</p>
              </div>

              <div class="journal-pnl-grid cognitive-quad-grid">
                <!-- Box 1: Xác suất nhớ thật lúc này -->
                <div class="pnl-stat-box cog-stat-retrievability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🧠</span>
                    <span class="pnl-box-label">XÁC SUẤT NHỚ THẬT</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-retrievability">0%</div>
                  <span class="pnl-box-sub">Tỉ lệ giữ trong não lúc này</span>
                </div>

                <!-- Box 2: Độ bền trung bình -->
                <div class="pnl-stat-box cog-stat-stability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⏳</span>
                    <span class="pnl-box-label">ĐỘ BỀN TRUNG BÌNH</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-stability">0<span class="pnl-unit">ngày</span></div>
                  <span class="pnl-box-sub">Lưu trữ trước khi cần ôn</span>
                </div>

                <!-- Box 3: Từ nhớ sâu -->
                <div class="pnl-stat-box cog-stat-deep">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">💎</span>
                    <span class="pnl-box-label">NHỚ SÂU VĨNH VIỄN</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-deep">+0<span class="pnl-unit">từ</span></div>
                  <span class="pnl-box-sub">Độ bền ≥ 30 ngày (Ôn 1-6 tháng)</span>
                </div>

                <!-- Box 4: Phản xạ nhanh -->
                <div class="pnl-stat-box cog-stat-reflex">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⚡</span>
                    <span class="pnl-box-label">PHẢN XẠ NHANH</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-accuracy">0%</div>
                  <span class="pnl-box-sub" id="cog-stat-recovery-sub">Tỉ lệ nhớ tốt & dễ</span>
                </div>
              </div>
            </div>

            <!-- 3. KHỐI 2: DỰ BÁO LỊCH ÔN 7 NGÀY (Unboxed Dải Capsule) -->
            <div class="stats-section-group stats-group-forecast">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    DỰ BÁO LỊCH ÔN 7 NGÀY
                  </span>
                  <div class="section-header-actions">
                    <span class="bento-badge-forecast" id="stats-forecast-total">0 từ / 7 ngày</span>
                    <button type="button" class="btn-open-calendar-modal" id="btn-open-calendar-modal" title="Xem lịch chi tiết">
                      <span>Lịch tháng ↗</span>
                    </button>
                  </div>
                </div>
                <p class="stats-section-hint">Dự báo số lượng từ vựng cần ôn lại trong 7 ngày tới theo FSRS-6</p>
              </div>

              <div class="forecast-capsules-grid" id="stats-review-forecast"></div>
            </div>

            <!-- 4. KHỐI 3: LỊCH HỌC TẬP THEO NGÀY (Heatmap Ô Vuông & Matrix Năm) -->
            <div class="stats-section-group" id="journal-main-container">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    LỊCH HỌC TẬP THEO NGÀY
                  </span>
                  
                  <div class="section-header-actions">
                    <div class="journal-view-toggle">
                      <button type="button" class="btn-toggle-mode active" data-mode="month" id="btn-mode-month">Tháng</button>
                      <button type="button" class="btn-toggle-mode" data-mode="year" id="btn-mode-year">Năm</button>
                    </div>
                    <div class="journal-legend">
                      <span>Ít</span>
                      <span class="legend-cell heat-0"></span>
                      <span class="legend-cell heat-1"></span>
                      <span class="legend-cell heat-2"></span>
                      <span class="legend-cell heat-3"></span>
                      <span class="legend-cell heat-4"></span>
                      <span>Nhiều</span>
                    </div>
                  </div>
                </div>
                <p class="stats-section-hint">Tần suất học tập và tích lũy từ vựng qua từng ngày</p>
              </div>

              <!-- Calendar Wrapper (Compact Card) -->
              <div class="bento-card journal-calendar-card" id="journal-month-section">
                <!-- Navigation Header -->
                <div class="journal-month-nav-row">
                  <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Tháng trước">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  
                  <div class="journal-period-info">
                    <span class="period-title" id="journal-period-title">Tháng ${_currentMonth}, ${_currentYear}</span>
                    <button type="button" class="btn-journal-today" id="btn-journal-today">Hôm nay</button>
                  </div>

                  <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Tháng sau">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>

                <!-- 7-Day Header -->
                <div class="calendar-weekdays-row">
                  <span class="weekday-cell">T2</span>
                  <span class="weekday-cell">T3</span>
                  <span class="weekday-cell">T4</span>
                  <span class="weekday-cell">T5</span>
                  <span class="weekday-cell">T6</span>
                  <span class="weekday-cell">T7</span>
                  <span class="weekday-cell sun">CN</span>
                </div>

                <!-- Calendar Grid Cells -->
                <div class="calendar-grid-cells" id="journal-calendar-grid"></div>

                <!-- Submeta summary bar -->
                <div class="journal-cal-summary-strip" id="journal-cal-summary">
                  <span id="journal-cal-summary-text">Tháng này: <strong>+0</strong> từ • <strong>0</strong> ngày học</span>
                </div>
              </div>

              <!-- Year Matrix Grid (Hidden in Month Mode) -->
              <div class="bento-card" id="journal-year-section" style="display: none;">
                <div class="year-matrix-grid" id="journal-year-grid"></div>
              </div>
            </div>

            <!-- 5. KHỐI 4: THÁP 5 TẦNG TRÍ NHỚ FSRS-6 (MEMORY STABILITY PYRAMID) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polygon points="12 2 2 22 22 22"/>
                    </svg>
                    THÁP 5 TẦNG ĐỘ BỀN TRÍ NHỚ
                  </span>
                  <span class="bento-badge-forecast" id="stats-pyramid-total">0 từ đã học</span>
                </div>
                <p class="stats-section-hint">Phân loại từ vựng theo thời gian lưu trữ trong trí nhớ dài hạn</p>
              </div>

              <div class="inset-grouped-card memory-pyramid-card">
                <!-- Multi-segment visual progress bar -->
                <div class="pyramid-segment-bar" id="pyramid-segment-bar">
                  <div class="seg-fill seg-tier5" id="seg-tier5" style="width: 0%;" title="Nhớ sâu (≥ 30d)"></div>
                  <div class="seg-fill seg-tier4" id="seg-tier4" style="width: 0%;" title="Bền vững (14-30d)"></div>
                  <div class="seg-fill seg-tier3" id="seg-tier3" style="width: 0%;" title="Trung hạn (7-14d)"></div>
                  <div class="seg-fill seg-tier2" id="seg-tier2" style="width: 0%;" title="Ngắn hạn (3-7d)"></div>
                  <div class="seg-fill seg-tier1" id="seg-tier1" style="width: 0%;" title="Mới nạp (< 3d)"></div>
                </div>

                <!-- 5 Tiers Detailed Rows -->
                <div class="pyramid-tiers-list">
                  <!-- Tier 5 -->
                  <div class="pyramid-tier-row tier-5">
                    <div class="tier-left">
                      <span class="tier-icon">💎</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 5: Nhớ sâu vĩnh viễn</strong>
                        <span class="tier-desc">Độ bền ≥ 30 ngày • Chu kỳ ôn 1 - 6 tháng</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-5">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-5">0%</span>
                    </div>
                  </div>

                  <!-- Tier 4 -->
                  <div class="pyramid-tier-row tier-4">
                    <div class="tier-left">
                      <span class="tier-icon">🛡️</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 4: Ghi nhớ bền vững</strong>
                        <span class="tier-desc">Độ bền 14 - 30 ngày • Chu kỳ ôn 2 - 4 tuần</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-4">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-4">0%</span>
                    </div>
                  </div>

                  <!-- Tier 3 -->
                  <div class="pyramid-tier-row tier-3">
                    <div class="tier-left">
                      <span class="tier-icon">🌳</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 3: Ghi nhớ trung hạn</strong>
                        <span class="tier-desc">Độ bền 7 - 14 ngày • Chu kỳ ôn 1 - 2 tuần</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-3">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-3">0%</span>
                    </div>
                  </div>

                  <!-- Tier 2 -->
                  <div class="pyramid-tier-row tier-2">
                    <div class="tier-left">
                      <span class="tier-icon">🌿</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 2: Trí nhớ ngắn hạn</strong>
                        <span class="tier-desc">Độ bền 3 - 7 ngày • Chu kỳ ôn 3 - 7 ngày</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-2">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-2">0%</span>
                    </div>
                  </div>

                  <!-- Tier 1 -->
                  <div class="pyramid-tier-row tier-1">
                    <div class="tier-left">
                      <span class="tier-icon">🌱</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 1: Mới nạp vào não</strong>
                        <span class="tier-desc">Độ bền &lt; 3 ngày • Cần củng cố hàng ngày</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-1">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-1">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6. KHỐI 5: PHÂN TÍCH PHẢN XẠ & TỈ LỆ PHỤC HỒI (RECALL REFLEX QUALITY) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    CHẤT LƯỢNG PHẢN XẠ & PHỤC HỒI
                  </span>
                  <span class="bento-badge-forecast" id="stats-total-reviews-badge">0 lượt ôn</span>
                </div>
                <p class="stats-section-hint">Tỉ lệ lựa chọn 4 mức độ nhớ và tốc độ phục hồi khi quên</p>
              </div>

              <div class="inset-grouped-card reflex-quality-card">
                <div class="reflex-quad-grid">
                  <div class="reflex-pill-item reflex-easy">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⚡</span>
                      <span class="reflex-pill-name">DỄ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-easy">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-easy">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-good">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">✨</span>
                      <span class="reflex-pill-name">TỐT</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-good">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-good">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-hard">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⏳</span>
                      <span class="reflex-pill-name">KHÓ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-hard">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-hard">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-again">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">❌</span>
                      <span class="reflex-pill-name">QUÊN</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-again">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-again">0%</span>
                  </div>
                </div>

                <div class="recovery-strip">
                  <div class="recovery-left">
                    <span class="recovery-icon">🛡️</span>
                    <div class="recovery-text">
                      <strong>Tỉ lệ phục hồi sau khi quên (Recovery):</strong>
                      <span class="recovery-sub">Số từ từng quên đã ôn lại và nhớ bền vững</span>
                    </div>
                  </div>
                  <span class="recovery-badge" id="reflex-recovery-val">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Day Popover Tooltip Container -->
      <div id="day-popover-tooltip" class="day-popover-tooltip" style="display: none;"></div>
    `;

    setupJournalEvents(container);
  }
}

function setupJournalEvents(container) {
  const btnPrev = container.querySelector('#btn-journal-prev');
  const btnNext = container.querySelector('#btn-journal-next');
  const btnToday = container.querySelector('#btn-journal-today');
  const btnMonth = container.querySelector('#btn-mode-month');
  const btnYear = container.querySelector('#btn-mode-year');

  if (btnPrev) {
    btnPrev.onclick = () => {
      hideDayPopover();
      if (_viewMode === 'month') {
        _currentMonth--;
        if (_currentMonth < 1) {
          _currentMonth = 12;
          _currentYear--;
        }
      } else {
        _currentYear--;
      }
      if (_cachedApp) renderStatsTab(_cachedApp);
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      hideDayPopover();
      if (_viewMode === 'month') {
        _currentMonth++;
        if (_currentMonth > 12) {
          _currentMonth = 1;
          _currentYear++;
        }
      } else {
        _currentYear++;
      }
      if (_cachedApp) renderStatsTab(_cachedApp);
    };
  }

  if (btnToday) {
    btnToday.onclick = () => {
      hideDayPopover();
      const now = new Date();
      _currentYear = now.getFullYear();
      _currentMonth = now.getMonth() + 1;
      if (_cachedApp) renderStatsTab(_cachedApp);
    };
  }

  if (btnMonth && btnYear) {
    btnMonth.onclick = () => {
      hideDayPopover();
      _viewMode = 'month';
      btnMonth.classList.add('active');
      btnYear.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'flex';
      if (secYear) secYear.style.display = 'none';
      if (_cachedApp) renderStatsTab(_cachedApp);
    };

    btnYear.onclick = () => {
      hideDayPopover();
      _viewMode = 'year';
      btnYear.classList.add('active');
      btnMonth.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'none';
      if (secYear) secYear.style.display = 'flex';
      if (_cachedApp) renderStatsTab(_cachedApp);
    };
  }

  // Dismiss popover on global click/touch outside
  if (!container._popoverBound) {
    container._popoverBound = true;
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.calendar-day-cell') && !e.target.closest('.day-popover-tooltip')) {
        hideDayPopover();
      }
    });
    window.addEventListener('scroll', () => hideDayPopover(), { passive: true });
  }
}

function showDayPopover(cell, dayObj) {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (!tooltip || !cell || !dayObj) return;

  const parts = dayObj.dateKey.split('-');
  const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  const dateTitle = dayObj.isToday ? `Hôm nay (${formatted})` : `Ngày ${formatted}`;

  tooltip.innerHTML = `
    <div class="popover-header">
      <span class="popover-date">📅 ${dateTitle}</span>
      <span class="popover-badge-total">${dayObj.count > 0 ? '+' + dayObj.count + ' từ' : '0 từ'}</span>
    </div>
    <div class="popover-body">
      <div class="popover-item">
        <span>📚 Từ đã học:</span>
        <strong>+${dayObj.count} từ</strong>
      </div>
      <div class="popover-item">
        <span>💎 Từ đã thuộc:</span>
        <strong>${dayObj.masteredCount || 0} từ</strong>
      </div>
      <div class="popover-item">
        <span>⏱️ Thời gian:</span>
        <strong>${dayObj.minutes} phút</strong>
      </div>
    </div>
  `;

  tooltip.style.display = 'flex';

  const rect = cell.getBoundingClientRect();
  const popWidth = tooltip.offsetWidth || 230;
  const popHeight = tooltip.offsetHeight || 120;

  let left = rect.left + (rect.width / 2) - (popWidth / 2);
  if (left < 10) left = 10;
  if (left + popWidth > window.innerWidth - 10) left = window.innerWidth - popWidth - 10;

  let top = rect.top - popHeight - 8;
  if (top < 10) {
    top = rect.bottom + 8;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  requestAnimationFrame(() => {
    tooltip.classList.add('active');
  });
}

function hideDayPopover() {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (tooltip) {
    tooltip.classList.remove('active');
    setTimeout(() => {
      if (!tooltip.classList.contains('active')) {
        tooltip.style.display = 'none';
      }
    }, 180);
  }
}

export function renderStatsTab(app) {
  try {
    _cachedApp = app;
    const container = document.getElementById('tab-stats');
    if (!container) return;
    renderStatsTabShell(container);

    const allCards = app.deckManager ? app.deckManager.getAllCards() : WORDS;

    // 1. Phân Tích Năng Lực Trí Nhớ Thật & Tháp FSRS-6
    const memoryIntel = StatsManager.getMemoryIntelligence(WORDS);

    // Header Badges
    const heroRank = container.querySelector('#stats-hero-rank');
    const heroScore = container.querySelector('#stats-hero-score');
    const headerAccuracy = container.querySelector('#stats-header-accuracy');

    if (heroRank) {
      heroRank.textContent = memoryIntel.rank.title;
      heroRank.style.color = memoryIntel.rank.color;
      heroRank.style.background = `${memoryIntel.rank.color}1a`;
      heroRank.style.borderColor = `${memoryIntel.rank.color}40`;
    }
    if (heroScore) {
      heroScore.textContent = `⚡ Điểm: ${memoryIntel.score}/1000`;
    }
    if (headerAccuracy) {
      headerAccuracy.textContent = `🧠 Khả năng nhớ: ${memoryIntel.currentRetrievability}%`;
    }

    const btnOpenOpt = container.querySelector('#btn-open-optimizer-from-stats');
    if (btnOpenOpt) {
      btnOpenOpt.onclick = () => {
        try {
          openBehavioralOptimizerModal(app);
        } catch (err) {
          console.error('Lỗi mở Behavioral Optimizer từ stats:', err);
        }
      };
    }

    // 4 Khối Chỉ Số Trí Nhớ Thật
    const elRetrievability = container.querySelector('#cog-stat-retrievability');
    const elStability = container.querySelector('#cog-stat-stability');
    const elDeep = container.querySelector('#cog-stat-deep');
    const elAccuracy = container.querySelector('#cog-stat-accuracy');

    if (elRetrievability) {
      elRetrievability.textContent = `${memoryIntel.currentRetrievability}%`;
    }
    if (elStability) {
      elStability.innerHTML = `${memoryIntel.avgStability}<span class="pnl-unit">ngày</span>`;
    }
    if (elDeep) {
      elDeep.innerHTML = `+${memoryIntel.tiers.tier5.count}<span class="pnl-unit">từ</span>`;
    }
    if (elAccuracy) {
      elAccuracy.textContent = `${memoryIntel.firstTryAccuracy}%`;
    }

    // 2. DỰ BÁO LỊCH ÔN 7 NGÀY TỚI (FSRS-6 Forecast)
    const forecastContainer = container.querySelector('#stats-review-forecast');
    const forecastTotalBadge = container.querySelector('#stats-forecast-total');

    if (forecastContainer) {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfTodayMs = today.getTime();
      const oneDayMs = 86400000;
      const sevenDaysMs = 7 * oneDayMs;

      let queueDue = 0;
      if (app.deckManager) {
        const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
        queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : 0;
      }

      const forecastCounts = [queueDue, 0, 0, 0, 0, 0, 0];

      for (const card of allCards) {
        const state = StorageManager.getCardState(card.id);
        if (state && state.due && state.state !== State.New && state.state !== 0) {
          const dueMs = new Date(state.due).getTime();
          const diffMs = dueMs - startOfTodayMs;
          if (diffMs >= oneDayMs && diffMs < sevenDaysMs) {
            const dayIndex = Math.floor(diffMs / oneDayMs);
            if (dayIndex >= 1 && dayIndex < 7) {
              forecastCounts[dayIndex]++;
            }
          }
        }
      }

      let totalWeekDue = 0;
      const maxForecast = Math.max(...forecastCounts, 1);
      forecastContainer.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const count = forecastCounts[i];
        totalWeekDue += count;

        const dayName = dayNames[d.getDay()];
        const label = i === 0 ? 'H.nay' : (i === 1 ? 'Mai' : dayName);
        const barWidthPct = count > 0 ? Math.min(100, Math.max(15, Math.round((count / maxForecast) * 100))) : 0;

        let loadClass = 'load-zero';
        if (count > 25) {
          loadClass = 'load-high';
        } else if (count > 10) {
          loadClass = 'load-med';
        } else if (count > 0) {
          loadClass = 'load-low';
        }

        const itemEl = document.createElement('div');
        itemEl.className = `forecast-smart-card ${i === 0 ? 'is-today' : ''} ${count > 0 ? 'has-due' : 'is-zero'}`;
        itemEl.title = `${label} (${d.getDate()}/${d.getMonth() + 1}): ${count} từ cần ôn. Chạm để xem chi tiết!`;

        itemEl.innerHTML = `
          <div class="fc-card-header">
            <span class="fc-card-day">${label}</span>
            <span class="fc-card-date">${d.getDate()}/${d.getMonth() + 1}</span>
          </div>
          <div class="fc-card-count ${count > 0 ? 'count-active ' + loadClass : ''}">${count}</div>
          <div class="fc-card-bar">
            <div class="fc-bar-fill ${count > 0 ? 'fill-active ' + loadClass : ''}" style="width: ${barWidthPct}%;"></div>
          </div>
        `;

        itemEl.onclick = () => {
          openCalendarForecastModal(app, d);
        };

        forecastContainer.appendChild(itemEl);
      }

      if (forecastTotalBadge) {
        forecastTotalBadge.textContent = `${totalWeekDue} từ / 7 ngày`;
      }

      const btnOpenCal = container.querySelector('#btn-open-calendar-modal');
      if (btnOpenCal) {
        btnOpenCal.onclick = () => {
          openCalendarForecastModal(app, new Date());
        };
      }
    }

    // 3. LỊCH HỌC TẬP THEO NGÀY (Activity Heatmap & Year Matrix)
    const periodTitle = container.querySelector('#journal-period-title');
    if (periodTitle) {
      if (_viewMode === 'month') {
        periodTitle.textContent = `Tháng ${_currentMonth}, ${_currentYear}`;
      } else {
        periodTitle.textContent = `Năm ${_currentYear}`;
      }
    }

    const monthData = StatsManager.getMonthJournalData(_currentYear, _currentMonth);

    // Summary Strip
    const calSummaryText = container.querySelector('#journal-cal-summary-text');
    if (calSummaryText) {
      calSummaryText.innerHTML = `Tháng này: <strong>+${monthData.monthTotalWords}</strong> từ đã học • <strong>${monthData.monthMasteredWords || 0}</strong> từ đã thuộc • <strong>${monthData.activeDaysCount}/${monthData.elapsedDays}</strong> ngày học`;
    }

    // Render Bảng Lịch Ô Vuông 7 Cột
    const grid = container.querySelector('#journal-calendar-grid');
    if (grid) {
      grid.innerHTML = '';
      const frag = document.createDocumentFragment();

      for (let i = 0; i < monthData.firstDayOfWeek; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'calendar-day-cell cell-empty-padding';
        frag.appendChild(padCell);
      }

      monthData.days.forEach(dayObj => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `calendar-day-cell heat-${dayObj.heatLevel} ${dayObj.isToday ? 'is-today' : ''} ${dayObj.isFuture ? 'is-future' : ''}`;
        cell.dataset.dateKey = dayObj.dateKey;

        const countText = dayObj.count > 0 ? `+${dayObj.count}` : (dayObj.isFuture ? '' : '0');

        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${dayObj.day}</span>
            ${dayObj.isToday ? '<span class="today-dot"></span>' : ''}
          </div>
          <div class="day-cell-bottom">
            <span class="day-pnl-val">${countText}</span>
          </div>
        `;

        if (!dayObj.isFuture) {
          cell.addEventListener('mouseenter', () => showDayPopover(cell, dayObj));
          cell.addEventListener('mouseleave', () => hideDayPopover());
          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            showDayPopover(cell, dayObj);
          });
        }

        frag.appendChild(cell);
      });

      grid.appendChild(frag);
    }

    // Render Ma Trận 12 Tháng Năm
    const yearGrid = container.querySelector('#journal-year-grid');
    if (yearGrid) {
      yearGrid.innerHTML = '';
      const yearData = StatsManager.getYearJournalData(_currentYear);
      const fragYear = document.createDocumentFragment();

      yearData.months.forEach(mObj => {
        const mCard = document.createElement('div');
        mCard.className = `year-month-card ${mObj.isCurrentMonth ? 'is-current' : ''}`;
        mCard.innerHTML = `
          <div class="year-month-header">
            <span class="year-month-name">${mObj.monthName}</span>
            <span class="year-month-words">${mObj.wordsCount > 0 ? '+' + mObj.wordsCount : '0'}</span>
          </div>
          <div class="year-month-bar">
            <div class="year-month-bar-fill" style="width: ${mObj.wordsCount > 0 ? Math.min(100, Math.max(8, Math.round((mObj.wordsCount / (yearData.maxMonthWords || 1)) * 100))) : 0}%;"></div>
          </div>
          <div class="year-month-footer">
            <span>${mObj.activeDays} ngày học</span>
            <span>${mObj.minutes}p</span>
          </div>
        `;

        mCard.onclick = () => {
          _currentMonth = mObj.month;
          _viewMode = 'month';
          const btnMonth = container.querySelector('#btn-mode-month');
          const btnYear = container.querySelector('#btn-mode-year');
          if (btnMonth) btnMonth.classList.add('active');
          if (btnYear) btnYear.classList.remove('active');
          const secMonth = container.querySelector('#journal-month-section');
          const secYear = container.querySelector('#journal-year-section');
          if (secMonth) secMonth.style.display = 'flex';
          if (secYear) secYear.style.display = 'none';
          renderStatsTab(app);
        };

        fragYear.appendChild(mCard);
      });

      yearGrid.appendChild(fragYear);
    }

    // 4. Tháp 5 Tầng Trí Nhớ (Memory Pyramid)
    const pyramidTotalBadge = container.querySelector('#stats-pyramid-total');
    if (pyramidTotalBadge) {
      pyramidTotalBadge.textContent = `${memoryIntel.totalLearned} từ đã học`;
    }

    const t5 = memoryIntel.tiers.tier5.count;
    const t4 = memoryIntel.tiers.tier4.count;
    const t3 = memoryIntel.tiers.tier3.count;
    const t2 = memoryIntel.tiers.tier2.count;
    const t1 = memoryIntel.tiers.tier1.count;
    const totalLearned = memoryIntel.totalLearned || 1;

    const p5 = Math.round((t5 / totalLearned) * 100);
    const p4 = Math.round((t4 / totalLearned) * 100);
    const p3 = Math.round((t3 / totalLearned) * 100);
    const p2 = Math.round((t2 / totalLearned) * 100);
    const p1 = Math.round((t1 / totalLearned) * 100);

    const seg5 = container.querySelector('#seg-tier5');
    const seg4 = container.querySelector('#seg-tier4');
    const seg3 = container.querySelector('#seg-tier3');
    const seg2 = container.querySelector('#seg-tier2');
    const seg1 = container.querySelector('#seg-tier1');

    if (seg5) seg5.style.width = `${p5}%`;
    if (seg4) seg4.style.width = `${p4}%`;
    if (seg3) seg3.style.width = `${p3}%`;
    if (seg2) seg2.style.width = `${p2}%`;
    if (seg1) seg1.style.width = `${p1}%`;

    const setTierCnt = (id, count, pct) => {
      const elCnt = container.querySelector(`#tier-cnt-${id}`);
      const elPct = container.querySelector(`#tier-pct-${id}`);
      if (elCnt) elCnt.textContent = `${count} từ`;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setTierCnt('5', t5, p5);
    setTierCnt('4', t4, p4);
    setTierCnt('3', t3, p3);
    setTierCnt('2', t2, p2);
    setTierCnt('1', t1, p1);

    // 5. Chất lượng Phản xạ & Phục hồi
    const totalRevBadge = container.querySelector('#stats-total-reviews-badge');
    if (totalRevBadge) {
      totalRevBadge.textContent = `${memoryIntel.totalRatings} lượt ôn`;
    }

    const setReflex = (type, count, pct) => {
      const elCnt = container.querySelector(`#reflex-cnt-${type}`);
      const elPct = container.querySelector(`#reflex-pct-${type}`);
      if (elCnt) elCnt.textContent = count;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setReflex('easy', memoryIntel.ratingCounts[4] || 0, memoryIntel.ratingPct.easy);
    setReflex('good', memoryIntel.ratingCounts[3] || 0, memoryIntel.ratingPct.good);
    setReflex('hard', memoryIntel.ratingCounts[2] || 0, memoryIntel.ratingPct.hard);
    setReflex('again', memoryIntel.ratingCounts[1] || 0, memoryIntel.ratingPct.again);

    const elRecoveryVal = container.querySelector('#reflex-recovery-val');
    if (elRecoveryVal) {
      elRecoveryVal.textContent = `${memoryIntel.recoveryRate}%`;
    }

  } catch (err) {
    console.error('Lỗi khi render Stats Tab:', err);
  }
}

/**
 * Mở Modal Lịch Tháng Dự Báo Chi Tiết
 */
export function openCalendarForecastModal(app, initialDate = new Date()) {
  let modal = document.getElementById('calendar-forecast-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'calendar-forecast-modal-overlay';
    modal.className = 'calendar-forecast-modal-overlay';
    document.body.appendChild(modal);
  }

  _calSelectedDate = new Date(initialDate);
  _calViewingYear = _calSelectedDate.getFullYear();
  _calViewingMonth = _calSelectedDate.getMonth();

  const renderModalContent = () => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const selectedDateKey = `${_calSelectedDate.getFullYear()}-${String(_calSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(_calSelectedDate.getDate()).padStart(2, '0')}`;

    const allCards = app.deckManager?.getAllCards() || WORDS;
    const monthDueMap = new Map();

    const startOfMonth = new Date(_calViewingYear, _calViewingMonth, 1);
    const endOfMonth = new Date(_calViewingYear, _calViewingMonth + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      monthDueMap.set(dateKey, []);
    }

    allCards.forEach(card => {
      const state = StorageManager.getCardState(card.id);
      if (state && state.due && state.state !== State.New && state.state !== 0) {
        const dueDate = new Date(state.due);
        if (dueDate.getFullYear() === _calViewingYear && dueDate.getMonth() === _calViewingMonth) {
          const day = dueDate.getDate();
          const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (monthDueMap.has(dateKey)) {
            monthDueMap.get(dateKey).push({ card, state });
          }
        }
      }
    });

    let totalMonthDue = 0;
    let maxDueInSingleDay = 0;
    let daysWithReviews = 0;

    monthDueMap.forEach(cardsList => {
      const count = cardsList.length;
      totalMonthDue += count;
      if (count > 0) {
        daysWithReviews++;
        if (count > maxDueInSingleDay) maxDueInSingleDay = count;
      }
    });

    const firstDayIndex = startOfMonth.getDay();
    const startDayOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const prevMonthEnd = new Date(_calViewingYear, _calViewingMonth, 0);
    const prevMonthDays = prevMonthEnd.getDate();

    modal.innerHTML = `
      <div class="calendar-forecast-dialog">
        <!-- 1. Header Dialog & Close -->
        <div class="cal-modal-header">
          <div class="cal-modal-title-wrap">
            <span class="cal-modal-icon">📅</span>
            <div class="cal-modal-titles">
              <h3 class="cal-modal-title">Lịch Dự Báo Ôn Tập</h3>
              <p class="cal-modal-sub">Dự báo theo thuật toán FSRS-6</p>
            </div>
          </div>
          <button class="btn-cal-modal-close" id="btn-close-cal-modal" title="Đóng (Esc)" aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 2. Navigation Tháng & Năm -->
        <div class="cal-nav-bar">
          <button class="btn-cal-nav" id="btn-cal-prev-month" title="Tháng trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div class="cal-nav-center">
            <span class="cal-nav-month">${monthNames[_calViewingMonth]} ${_calViewingYear}</span>
            <button class="btn-cal-today-jump" id="btn-cal-today-jump">Hôm nay</button>
          </div>

          <button class="btn-cal-nav" id="btn-cal-next-month" title="Tháng sau">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <!-- 3. Mini Summary Pills -->
        <div class="cal-summary-pills">
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Tổng ôn tháng:</span>
            <strong class="cal-sum-val">${totalMonthDue} từ</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Ngày có bài:</span>
            <strong class="cal-sum-val">${daysWithReviews} / ${daysInMonth} ngày</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Cao điểm nhất:</span>
            <strong class="cal-sum-val">${maxDueInSingleDay} từ/ngày</strong>
          </div>
        </div>

        <!-- 4. Calendar Month Grid Table -->
        <div class="cal-grid-container">
          <div class="cal-weekdays-header">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>

          <div class="cal-days-grid" id="cal-days-grid">
            <!-- Grid cells generated dynamically -->
          </div>
        </div>

        <!-- 5. Selected Day Detail Drawer / Inspector -->
        <div class="cal-day-inspector" id="cal-day-inspector">
          <!-- Inspector content generated dynamically -->
        </div>
      </div>
    `;

    // Render các ô ngày vào Grid
    const daysGrid = modal.querySelector('#cal-days-grid');
    if (daysGrid) {
      const frag = document.createDocumentFragment();

      // A. Ngày mờ của tháng trước
      for (let i = startDayOffset - 1; i >= 0; i--) {
        const prevDayNum = prevMonthDays - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${prevDayNum}</span>`;
        frag.appendChild(cell);
      }

      // B. Toàn bộ 28 - 31 ngày của tháng hiện tại
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDateKey;
        const dayCards = monthDueMap.get(dateKey) || [];
        const count = dayCards.length;

        let loadClass = 'load-zero';
        if (count > 0 && count <= 3) loadClass = 'load-low';
        else if (count > 3 && count <= 8) loadClass = 'load-medium';
        else if (count > 8) loadClass = 'load-high';

        const cell = document.createElement('div');
        cell.className = `cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${loadClass}`;
        cell.setAttribute('data-date-key', dateKey);
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');

        cell.innerHTML = `
          <div class="cal-day-cell-top">
            <span class="cal-day-num">${day}</span>
            ${isToday ? '<span class="cal-today-badge" title="Hôm nay">Nay</span>' : ''}
          </div>
          <div class="cal-day-cell-bottom">
            ${count > 0 ? `<span class="cal-count-badge">${count}</span>` : '<span class="cal-empty-dot">·</span>'}
          </div>
        `;

        cell.onclick = () => {
          _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, day);
          renderModalContent();
        };

        frag.appendChild(cell);
      }

      // C. Ngày mờ của tháng sau để hoàn thành hàng lưới 35 hoặc 42 ô
      const totalRendered = startDayOffset + daysInMonth;
      const targetTotal = totalRendered <= 35 ? 35 : 42;
      const remainingCells = targetTotal - totalRendered;
      for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${nextDay}</span>`;
        frag.appendChild(cell);
      }

      daysGrid.appendChild(frag);
    }

    // Render Khung Chi Tiết Ngày Đang Chọn
    const inspector = modal.querySelector('#cal-day-inspector');
    if (inspector) {
      const selDay = _calSelectedDate.getDate();
      const selMonth = _calSelectedDate.getMonth() + 1;
      const selYear = _calSelectedDate.getFullYear();
      const selDateFormatted = `${String(selDay).padStart(2, '0')}/${String(selMonth).padStart(2, '0')}/${selYear}`;
      const dayCards = monthDueMap.get(selectedDateKey) || [];
      const isSelectedToday = selectedDateKey === todayKey;

      let inspectorHtml = `
        <div class="inspector-header">
          <div class="inspector-header-left">
            <div class="inspector-date-title">Ngày ${selDateFormatted}</div>
            <div class="inspector-tags-row">
              ${isSelectedToday ? '<span class="inspector-today-tag">Hôm nay</span>' : ''}
              <span class="inspector-count-tag">${dayCards.length} từ đến hạn ôn</span>
            </div>
          </div>
          ${dayCards.length > 0 ? `
            <button class="btn-inspector-study" id="btn-inspector-study-day">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Ôn ${dayCards.length} từ này</span>
            </button>
          ` : ''}
        </div>
      `;

      if (dayCards.length === 0) {
        inspectorHtml += `
          <div class="inspector-empty">
            <span class="inspector-empty-icon">✨</span>
            <p class="inspector-empty-text">Không có từ vựng nào đến hạn ôn trong ngày này.</p>
          </div>
        `;
      } else {
        inspectorHtml += `<div class="inspector-words-list">`;
        dayCards.forEach(({ card, state }) => {
          const cefr = (card.cefr || card.level || 'A1').toLowerCase();
          const s = state?.stability ? Number(state.stability).toFixed(1) : '0';
          const phonetic = card.phonetic || card.ipa || '';

          inspectorHtml += `
            <div class="inspector-word-item" data-word="${escapeHTML(card.word || '')}">
              <button class="btn-inspector-sound" data-word="${escapeHTML(card.word || '')}" title="Phát âm" aria-label="Phát âm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
              <div class="inspector-word-info">
                <div class="inspector-word-top">
                  <strong class="inspector-word-text">${escapeHTML(card.word || '')}</strong>
                  ${phonetic ? `<span class="inspector-word-ipa">${escapeHTML(phonetic)}</span>` : ''}
                  <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
                </div>
                <div class="inspector-word-meaning">${escapeHTML(card.meaning || '')}</div>
              </div>
              <div class="inspector-word-stability" title="Độ bền trí nhớ FSRS (Stability)">
                <span>S: ${s}d</span>
              </div>
            </div>
          `;
        });
        inspectorHtml += `</div>`;
      }

      inspector.innerHTML = inspectorHtml;

      // Event: Phát âm từ vựng trong inspector
      inspector.querySelectorAll('.btn-inspector-sound').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const w = btn.getAttribute('data-word');
          if (w) {
            btn.classList.add('playing');
            speak(w);
            setTimeout(() => btn.classList.remove('playing'), 1200);
          }
        };
      });

      // Event: Ôn tập danh sách từ của ngày này
      const btnStudyDay = inspector.querySelector('#btn-inspector-study-day');
      if (btnStudyDay && dayCards.length > 0) {
        btnStudyDay.onclick = () => {
          closeModal();
          app.startStudySession(null, null, dayCards.map(d => d.card));
        };
      }
    }

    // Điều hướng Tháng trước / Tháng sau / Hôm nay
    const btnPrev = modal.querySelector('#btn-cal-prev-month');
    const btnNext = modal.querySelector('#btn-cal-next-month');
    const btnToday = modal.querySelector('#btn-cal-today-jump');

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (_calViewingMonth === 0) {
          _calViewingMonth = 11;
          _calViewingYear--;
        } else {
          _calViewingMonth--;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        if (_calViewingMonth === 11) {
          _calViewingMonth = 0;
          _calViewingYear++;
        } else {
          _calViewingMonth++;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnToday) {
      btnToday.onclick = () => {
        const now = new Date();
        _calSelectedDate = now;
        _calViewingYear = now.getFullYear();
        _calViewingMonth = now.getMonth();
        renderModalContent();
      };
    }

    const btnClose = modal.querySelector('#btn-close-cal-modal');
    if (btnClose) btnClose.onclick = closeModal;
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  renderModalContent();
}
