/**
 * Stats View - Spaced Repetition Learning Journal & Activity Heatmap
 * 1. Bảng ô vuông lịch tháng 7 cột (T2 -> CN) hiển thị số từ tích lũy mỗi ngày
 * 2. Thang nhiệt độ hoạt động học tập (Activity Heatmap)
 * 3. Bảng chỉ số hiệu suất tháng: Tổng từ đã học, Tỷ lệ chuyên cần, Chuỗi ngày học, Thời gian tập trung
 * 4. Chi tiết tiến độ từng ngày khi nhấp chọn
 * 5. Ma trận 12 tháng tổng quan theo năm
 */

import { StatsManager } from '../core/stats.js';
import { getLocalDateKey } from '../utils.js';

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12
let _selectedDateKey = getLocalDateKey(new Date());
let _viewMode = 'month'; // 'month' | 'year'
let _cachedApp = null;

export function renderStatsTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = `
      <!-- 1. Top Unboxed Page Header -->
      <div class="stats-hero-banner">
        <div class="stats-hero-left">
          <div class="stats-hero-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
          </div>
          <div class="stats-hero-text">
            <h2 class="stats-hero-title">Nhật Ký Học Tập</h2>
            <p class="stats-hero-subtitle">Tiến độ tích lũy từ vựng & lịch học hàng ngày</p>
          </div>
        </div>
        <div class="stats-hero-badges">
          <span class="stats-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.25);">FSRS-6</span>
        </div>
      </div>

      <!-- 2. Navigation & View Switcher Toolbar (1-Row Balanced Layout) -->
      <div class="journal-nav-bar">
        <div class="journal-month-nav">
          <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Kỳ trước">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div class="journal-month-title-wrap">
            <span class="journal-month-title" id="journal-period-title">Tháng 9, 2026</span>
          </div>

          <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Kỳ sau">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <div class="journal-nav-right">
          <button type="button" class="btn-journal-today" id="btn-journal-today" title="Về tháng hiện tại">
            Hôm nay
          </button>
          <div class="journal-view-toggle">
            <button type="button" class="btn-toggle-mode active" data-mode="month" id="btn-mode-month">Tháng</button>
            <button type="button" class="btn-toggle-mode" data-mode="year" id="btn-mode-year">Năm</button>
          </div>
        </div>
      </div>

      <!-- 3. Monthly Performance Metrics -->
      <div class="stats-section-group">
        <div class="section-group-header">
          <span class="section-group-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            HIỆU SUẤT TRONG THÁNG
          </span>
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
            <span class="pnl-box-sub">Kỷ lục liên tục</span>
          </div>

          <!-- Box 4: Thời gian học -->
          <div class="pnl-stat-box pnl-time">
            <div class="pnl-box-header">
              <span class="pnl-box-icon">⏱️</span>
              <span class="pnl-box-label">THỜI GIAN</span>
            </div>
            <div class="pnl-box-val" id="journal-pnl-time">0<span class="pnl-unit">phút</span></div>
            <span class="pnl-box-sub" id="journal-pnl-retention">Độ ghi nhớ: 100%</span>
          </div>
        </div>
      </div>

      <!-- 4. Month Calendar Heatmap (7-Column Activity Grid) -->
      <div class="stats-section-group" id="journal-month-section">
        <div class="section-group-header">
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <span class="section-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              LỊCH HỌC TẬP THEO NGÀY (ACTIVITY HEATMAP)
            </span>
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

      <!-- 5. Year Matrix Grid (Hidden in Month Mode) -->
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
      _selectedDateKey = getLocalDateKey(now);
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

  // Định vị trí popup phía trên hoặc dưới ô ngày
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

    // Cập nhật tiêu đề thanh điều hướng
    const periodTitle = container.querySelector('#journal-period-title');
    if (periodTitle) {
      if (_viewMode === 'month') {
        periodTitle.textContent = `Tháng ${_currentMonth}, ${_currentYear}`;
      } else {
        periodTitle.textContent = `Năm ${_currentYear}`;
      }
    }

    // Lấy dữ liệu tháng
    const monthData = StatsManager.getMonthJournalData(_currentYear, _currentMonth);

    // 1. Cập nhật 4 Hộp Hiệu Suất Tháng
    const pnlTotal = container.querySelector('#journal-pnl-total');
    const pnlWinrate = container.querySelector('#journal-pnl-winrate');
    const pnlActiveDays = container.querySelector('#journal-pnl-active-days');
    const pnlStreak = container.querySelector('#journal-pnl-streak');
    const pnlTime = container.querySelector('#journal-pnl-time');
    const pnlRetention = container.querySelector('#journal-pnl-retention');

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
    if (pnlRetention) pnlRetention.textContent = `Độ ghi nhớ: ${monthData.avgRetention}%`;

    // 2. Render Bảng Lịch Ô Vuông 7 Cột
    const grid = container.querySelector('#journal-calendar-grid');
    if (grid) {
      grid.innerHTML = '';
      const frag = document.createDocumentFragment();

      // Thêm các ô trống padding trước ngày 1
      for (let i = 0; i < monthData.firstDayOfWeek; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'calendar-day-cell cell-empty-padding';
        frag.appendChild(padCell);
      }

      // Thêm các ô ngày trong tháng (1..daysInMonth)
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

        // Desktop: hover
        cell.onmouseenter = () => showDayPopover(cell, dayObj);
        cell.onmouseleave = () => hideDayPopover();

        // Mobile: tap / click
        cell.onclick = (e) => {
          e.stopPropagation();
          showDayPopover(cell, dayObj);
        };

        frag.appendChild(cell);
      });

      grid.appendChild(frag);
    }

    // 3. Render Ma trận 12 tháng khi ở chế độ Năm
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
