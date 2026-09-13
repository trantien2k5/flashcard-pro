/**
 * Stats View - Spaced Repetition Learning Journal, Cognitive Analytics & Activity Heatmap
 * 1. Đánh giá Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6 (True Retrievability R, Average Stability, Cognitive Score, Rank)
 * 2. Tháp 5 Tầng Độ Bền Trí Nhớ (Memory Stability Pyramid)
 * 3. Phân Tích Phản Xạ & Tỉ Lệ Phục Hồi (Recall Quality & Recovery Rate)
 * 4. Bảng Chỉ Số Hiệu Suất Tháng (Tổng từ tích lũy, Tỷ lệ chuyên cần, Chuỗi kỷ lục, Thời gian tập trung)
 * 5. Bảng Ô Vuông Lịch Học Theo Ngày 7 Cột (Activity Heatmap) & Ma Trận 12 Tháng
 */

import { WORDS } from '../../data/index.js';
import { StatsManager } from '../core/stats.js';

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12
let _viewMode = 'month'; // 'month' | 'year'
let _cachedApp = null;

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
              <h2 class="stats-hero-title">Nhật Ký & Năng Lực Trí Nhớ</h2>
              <p class="stats-hero-subtitle">Đánh giá trí nhớ thật theo FSRS-6 & nhật ký học tập chuyên sâu</p>
            </div>
          </div>
          <div class="stats-hero-badges">
            <span class="stats-pill-badge stats-rank-pill" id="stats-hero-rank">🌱 Khởi Động</span>
            <span class="stats-pill-badge stats-score-pill" id="stats-hero-score">⚡ 0/1000</span>
          </div>
        </div>

        <!-- Main Responsive Layout (2-Column on Desktop, 1-Column on Mobile) -->
        <div class="stats-main-grid">
          <!-- CỘT TRÁI: NĂNG LỰC TRÍ NHỚ, THÁP 5 TẦNG & PHẢN XẠ -->
          <div class="stats-col-left">
            <!-- 2. KHỐI 1: NĂNG LỰC TRÍ NHỚ THẬT (FSRS-6 COGNITIVE CAPACITY) -->
            <div class="stats-section-group">
              <div class="section-group-header">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                  <span class="section-group-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>
                    </svg>
                    NĂNG LỰC TRÍ NHỚ THẬT
                  </span>
                  <span class="stats-accuracy-pill" id="stats-header-accuracy">🧠 Khả năng nhớ: 0%</span>
                </div>
                <span class="section-group-hint">Chỉ số toán học FSRS phản ánh trực tiếp khả năng lưu giữ từ vựng trong não</span>
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

            <!-- 3. KHỐI 2: THÁP 5 TẦNG TRÍ NHỚ FSRS-6 (MEMORY STABILITY PYRAMID) -->
            <div class="stats-section-group">
              <div class="section-group-header">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                  <span class="section-group-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polygon points="12 2 2 22 22 22"/>
                    </svg>
                    THÁP 5 TẦNG ĐỘ BỀN TRÍ NHỚ
                  </span>
                  <span class="bento-badge-forecast" id="stats-pyramid-total">0 từ đã học</span>
                </div>
                <span class="section-group-hint">Phân loại từ vựng theo thời gian lưu trữ trong trí nhớ dài hạn</span>
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

            <!-- 4. KHỐI 3: PHÂN TÍCH PHẢN XẠ & TỈ LỆ PHỤC HỒI (RECALL REFLEX QUALITY) -->
            <div class="stats-section-group">
              <div class="section-group-header">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                  <span class="section-group-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    CHẤT LƯỢNG PHẢN XẠ & PHỤC HỒI
                  </span>
                  <span class="bento-badge-forecast" id="stats-total-reviews-badge">0 lượt ôn</span>
                </div>
                <span class="section-group-hint">Tỉ lệ lựa chọn 4 mức độ nhớ và tốc độ phục hồi khi quên</span>
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

          <!-- CỘT PHẢI: HIỆU SUẤT THỜI GIAN & LỊCH HEATMAP -->
          <div class="stats-col-right">
            <!-- 5. KHỐI 4: HIỆU SUẤT THỜI GIAN (MONTHLY/YEARLY METRICS) -->
            <div class="stats-section-group">
              <div class="section-group-header">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                  <span class="section-group-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    HIỆU SUẤT THEO THÁNG
                  </span>
                  
                  <div class="journal-nav-bar-compact">
                    <div class="journal-month-nav">
                      <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Kỳ trước">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      
                      <div class="journal-month-title-wrap">
                        <span class="journal-month-title" id="journal-period-title">Tháng 9, 2026</span>
                      </div>

                      <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Kỳ sau">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>

                    <button type="button" class="btn-journal-today" id="btn-journal-today" title="Về tháng hiện tại">
                      Hôm nay
                    </button>
                  </div>
                </div>
                <span class="section-group-hint">Tổng kết từ vựng tích lũy và mức độ chuyên cần</span>
              </div>

              <div class="journal-pnl-grid">
                <!-- Box 1: Tổng từ tích lũy -->
                <div class="pnl-stat-box pnl-profit">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">📚</span>
                    <span class="pnl-box-label">TỪ ĐÃ HỌC</span>
                  </div>
                  <div class="pnl-box-val" id="journal-pnl-total">+0</div>
                  <span class="pnl-box-sub">Từ vựng tích lũy</span>
                </div>

                <!-- Box 2: Tỷ lệ ngày học đều đặn -->
                <div class="pnl-stat-box pnl-winrate">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🎯</span>
                    <span class="pnl-box-label">CHUYÊN CẦN</span>
                  </div>
                  <div class="pnl-box-val" id="journal-pnl-winrate">0%</div>
                  <span class="pnl-box-sub" id="journal-pnl-active-days">0/0 ngày học</span>
                </div>

                <!-- Box 3: Chuỗi dài nhất -->
                <div class="pnl-stat-box pnl-streak">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🔥</span>
                    <span class="pnl-box-label">CHUỖI HỌC</span>
                  </div>
                  <div class="pnl-box-val" id="journal-pnl-streak">0<span class="pnl-unit">ngày</span></div>
                  <span class="pnl-box-sub">Kỷ lục trong tháng</span>
                </div>

                <!-- Box 4: Thời gian học -->
                <div class="pnl-stat-box pnl-time">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⏱️</span>
                    <span class="pnl-box-label">THỜI GIAN</span>
                  </div>
                  <div class="pnl-box-val" id="journal-pnl-time">0<span class="pnl-unit">phút</span></div>
                  <span class="pnl-box-sub" id="journal-pnl-retention">Thời gian tập trung</span>
                </div>
              </div>
            </div>

            <!-- Month Calendar Heatmap (7-Column Activity Grid) -->
            <div class="stats-section-group" id="journal-month-section">
              <div class="section-group-header">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                  <span class="section-group-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    LỊCH HỌC TẬP THEO NGÀY
                  </span>
                  
                  <div style="display:flex; align-items:center; gap:8px;">
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
                <span class="section-group-hint">Chạm hoặc di chuột vào ô bất kỳ để xem nhanh chi tiết</span>
              </div>

              <div class="inset-grouped-card journal-calendar-wrapper">
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
              </div>
            </div>

            <!-- Year Matrix Grid (Hidden in Month Mode) -->
            <div class="stats-section-group" id="journal-year-section" style="display: none;">
              <div class="section-group-header">
                <span class="section-group-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                  TỔNG QUAN 12 THÁNG TRONG NĂM
                </span>
                <span class="section-group-hint">Số từ vựng tích lũy và số ngày học theo từng tháng</span>
              </div>

              <div class="inset-grouped-card" style="padding: 14px 16px;">
                <div class="year-matrix-grid" id="journal-year-grid"></div>
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
      renderStatsTab(_cachedApp);
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
      renderStatsTab(_cachedApp);
    };
  }

  if (btnToday) {
    btnToday.onclick = () => {
      hideDayPopover();
      const now = new Date();
      _currentYear = now.getFullYear();
      _currentMonth = now.getMonth() + 1;
      renderStatsTab(_cachedApp);
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
      renderStatsTab(_cachedApp);
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
      renderStatsTab(_cachedApp);
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
        <span>📚 Từ mới học:</span>
        <strong>+${dayObj.newCount} từ</strong>
      </div>
      <div class="popover-item">
        <span>🔄 Ôn tập lại:</span>
        <strong>${dayObj.reviewCount} từ</strong>
      </div>
      <div class="popover-item">
        <span>🎯 Độ ghi nhớ:</span>
        <strong>${dayObj.retention}%</strong>
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

    // Tháp 5 Tầng Trí Nhớ (Memory Pyramid)
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

    // Chất lượng Phản xạ & Phục hồi
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

    // 2. Cập Nhật Tiêu Đề Tháng & Bảng Lịch Hoạt Động (Journal)
    const periodTitle = container.querySelector('#journal-period-title');
    if (periodTitle) {
      if (_viewMode === 'month') {
        periodTitle.textContent = `Tháng ${_currentMonth}, ${_currentYear}`;
      } else {
        periodTitle.textContent = `Năm ${_currentYear}`;
      }
    }

    const monthData = StatsManager.getMonthJournalData(_currentYear, _currentMonth);

    // 4 Hộp Hiệu Suất Tháng
    const pnlTotal = container.querySelector('#journal-pnl-total');
    const pnlWinrate = container.querySelector('#journal-pnl-winrate');
    const pnlActiveDays = container.querySelector('#journal-pnl-active-days');
    const pnlStreak = container.querySelector('#journal-pnl-streak');
    const pnlTime = container.querySelector('#journal-pnl-time');

    if (pnlTotal) pnlTotal.textContent = `+${monthData.monthTotalWords}`;
    if (pnlWinrate) pnlWinrate.textContent = `${monthData.winRate}%`;
    if (pnlActiveDays) pnlActiveDays.textContent = `${monthData.activeDaysCount}/${monthData.elapsedDays} ngày học`;
    if (pnlStreak) pnlStreak.innerHTML = `${monthData.maxStreakInMonth}<span class="pnl-unit">ngày</span>`;

    const hours = Math.floor(monthData.monthTotalMinutes / 60);
    const mins = monthData.monthTotalMinutes % 60;
    const timeStr = hours > 0 
      ? `${hours}<span class="pnl-unit">g</span> ${mins}<span class="pnl-unit">p</span>` 
      : `${mins}<span class="pnl-unit">phút</span>`;
    if (pnlTime) pnlTime.innerHTML = timeStr;

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

        cell.onmouseenter = () => showDayPopover(cell, dayObj);
        cell.onmouseleave = () => hideDayPopover();

        cell.onclick = (e) => {
          e.stopPropagation();
          showDayPopover(cell, dayObj);
        };

        frag.appendChild(cell);
      });

      grid.appendChild(frag);
    }

    // Render Ma trận 12 tháng khi ở chế độ Năm
    if (_viewMode === 'year') {
      const yearGrid = container.querySelector('#journal-year-grid');
      if (yearGrid) {
        yearGrid.innerHTML = '';
        const yearData = StatsManager.getYearlyJournalData(_currentYear);
        const yFrag = document.createDocumentFragment();

        const monthNames = [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
          'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
          'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];

        yearData.months.forEach((mObj, idx) => {
          const mCard = document.createElement('div');
          mCard.className = 'year-month-card';
          mCard.innerHTML = `
            <div class="year-month-header">
              <span class="year-month-name">${monthNames[idx]}</span>
              <span class="year-month-pnl ${mObj.monthTotalWords > 0 ? 'pnl-positive' : ''}">+${mObj.monthTotalWords} từ</span>
            </div>
            <div class="year-month-sub">
              <span>🎯 ${mObj.activeDaysCount}/${mObj.daysInMonth} ngày</span>
              <span>•</span>
              <span>🔥 Max ${mObj.maxStreakInMonth}d</span>
            </div>
          `;
          mCard.onclick = () => {
            _currentMonth = idx + 1;
            const btnMonth = container.querySelector('#btn-mode-month');
            if (btnMonth) btnMonth.click();
          };
          yFrag.appendChild(mCard);
        });

        yearGrid.appendChild(yFrag);
      }
    }

  } catch (err) {
    console.error('Lỗi khi hiển thị tab Thống Kê:', err);
  }
}
