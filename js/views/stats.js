/**
 * Stats View - Trader-Style Vocabulary Journal & Calendar P&L Heatmap
 * 1. Bảng ô vuông lịch tháng 7 cột (T2 -> CN) hiển thị "+N từ" mỗi ngày
 * 2. Thang nhiệt độ PnL (Heatmap Profit Scale)
 * 3. Bảng chỉ số hiệu suất tháng: Lợi nhuận từ vựng, Win Rate kỷ luật, Best Streak, Thời gian học
 * 4. Inspector chi tiết từng ngày khi click
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
            <p class="stats-hero-subtitle">Bảng lãi lỗ từ vựng & lịch kỷ luật theo phong cách Trader</p>
          </div>
        </div>
        <div class="stats-hero-badges">
          <span class="stats-pill-badge" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">Trader Journal</span>
        </div>
      </div>

      <!-- 2. Navigation & View Switcher Toolbar -->
      <div class="journal-nav-bar">
        <div class="journal-month-nav">
          <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Tháng trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div class="journal-month-title-wrap">
            <span class="journal-month-title" id="journal-period-title">Tháng 9, 2026</span>
          </div>

          <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Tháng sau">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <button type="button" class="btn-journal-today" id="btn-journal-today" title="Về tháng hiện tại">
            Hôm nay
          </button>
        </div>

        <div class="journal-view-toggle">
          <button type="button" class="btn-toggle-mode active" data-mode="month" id="btn-mode-month">Tháng</button>
          <button type="button" class="btn-toggle-mode" data-mode="year" id="btn-mode-year">Năm</button>
        </div>
      </div>

      <!-- 3. Monthly Performance Metrics (Trader P&L Cards) -->
      <div class="stats-section-group">
        <div class="section-group-header">
          <span class="section-group-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            HIỆU SUẤT TRONG THÁNG
          </span>
          <span class="section-group-hint">Lợi nhuận từ vựng tích lũy và chỉ số kỷ luật</span>
        </div>

        <div class="inset-grouped-card" style="padding: 12px 14px;">
          <div class="journal-pnl-grid">
            <!-- Box 1: Tổng từ tích lũy (PnL) -->
            <div class="pnl-stat-box pnl-profit">
              <div class="pnl-box-header">
                <span class="pnl-box-icon">📈</span>
                <span class="pnl-box-label">LỢI NHUẬN TỪ</span>
              </div>
              <div class="pnl-box-val" id="journal-pnl-total">+0</div>
              <span class="pnl-box-sub">Từ vựng tích lũy</span>
            </div>

            <!-- Box 2: Tỷ lệ ngày kỷ luật (Win Rate) -->
            <div class="pnl-stat-box pnl-winrate">
              <div class="pnl-box-header">
                <span class="pnl-box-icon">🎯</span>
                <span class="pnl-box-label">WIN RATE</span>
              </div>
              <div class="pnl-box-val" id="journal-pnl-winrate">0%</div>
              <span class="pnl-box-sub" id="journal-pnl-active-days">0/0 ngày học</span>
            </div>

            <!-- Box 3: Chuỗi dài nhất -->
            <div class="pnl-stat-box pnl-streak">
              <div class="pnl-box-header">
                <span class="pnl-box-icon">🔥</span>
                <span class="pnl-box-label">MAX STREAK</span>
              </div>
              <div class="pnl-box-val" id="journal-pnl-streak">0 ngày</div>
              <span class="pnl-box-sub">Kỷ luật liên tục</span>
            </div>

            <!-- Box 4: Thời gian học -->
            <div class="pnl-stat-box pnl-time">
              <div class="pnl-box-header">
                <span class="pnl-box-icon">⏱️</span>
                <span class="pnl-box-label">THỜI GIAN</span>
              </div>
              <div class="pnl-box-val" id="journal-pnl-time">0p</div>
              <span class="pnl-box-sub" id="journal-pnl-retention">Độ nhớ: 100%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Month Calendar Heatmap (7-Column Trader Grid) -->
      <div class="stats-section-group" id="journal-month-section">
        <div class="section-group-header">
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <span class="section-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              LỊCH LÃI LỖ THEO NGÀY (P&L CALENDAR)
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
          <span class="section-group-hint">Mỗi ô đại diện cho 1 ngày với số từ vựng đạt được</span>
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

      <!-- 5. Day Inspector Card (Detail of selected day) -->
      <div class="stats-section-group" id="journal-inspector-section">
        <div class="section-group-header">
          <span class="section-group-title" id="journal-inspector-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            CHI TIẾT NGÀY: HÔM NAY
          </span>
          <span class="section-group-hint" id="journal-inspector-subtitle">Nhấp vào ô ngày bất kỳ trên lịch để xem phân tích</span>
        </div>

        <div class="inset-grouped-card" style="padding: 14px 16px;">
          <div class="inspector-detail-grid" id="journal-inspector-grid">
            <div class="inspector-tile">
              <span class="tile-lbl">Từ mới học</span>
              <span class="tile-val profit-val" id="day-new-val">+0 từ</span>
            </div>
            <div class="inspector-tile">
              <span class="tile-lbl">Ôn tập lại</span>
              <span class="tile-val" id="day-review-val">0 từ</span>
            </div>
            <div class="inspector-tile">
              <span class="tile-lbl">Tỷ lệ nhớ đúng</span>
              <span class="tile-val" id="day-retention-val">100%</span>
            </div>
            <div class="inspector-tile">
              <span class="tile-lbl">Thời gian tập trung</span>
              <span class="tile-val" id="day-time-val">0 phút</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Year Matrix Grid (Hidden in Month Mode) -->
      <div class="stats-section-group" id="journal-year-section" style="display: none;">
        <div class="section-group-header">
          <span class="section-group-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            TỔNG QUAN 12 THÁNG TRONG NĂM
          </span>
          <span class="section-group-hint">Số từ vựng và số ngày kỷ luật theo từng tháng</span>
        </div>

        <div class="inset-grouped-card" style="padding: 14px 16px;">
          <div class="year-matrix-grid" id="journal-year-grid"></div>
        </div>
      </div>
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
      const now = new Date();
      _currentYear = now.getFullYear();
      _currentMonth = now.getMonth() + 1;
      _selectedDateKey = getLocalDateKey(now);
      renderStatsTab(_cachedApp);
    };
  }

  if (btnMonth && btnYear) {
    btnMonth.onclick = () => {
      _viewMode = 'month';
      btnMonth.classList.add('active');
      btnYear.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secInsp = container.querySelector('#journal-inspector-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'flex';
      if (secInsp) secInsp.style.display = 'flex';
      if (secYear) secYear.style.display = 'none';
      renderStatsTab(_cachedApp);
    };

    btnYear.onclick = () => {
      _viewMode = 'year';
      btnYear.classList.add('active');
      btnMonth.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secInsp = container.querySelector('#journal-inspector-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'none';
      if (secInsp) secInsp.style.display = 'none';
      if (secYear) secYear.style.display = 'flex';
      renderStatsTab(_cachedApp);
    };
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

    // 1. Cập nhật 4 Hộp PnL Tháng
    const pnlTotal = container.querySelector('#journal-pnl-total');
    const pnlWinrate = container.querySelector('#journal-pnl-winrate');
    const pnlActiveDays = container.querySelector('#journal-pnl-active-days');
    const pnlStreak = container.querySelector('#journal-pnl-streak');
    const pnlTime = container.querySelector('#journal-pnl-time');
    const pnlRetention = container.querySelector('#journal-pnl-retention');

    if (pnlTotal) pnlTotal.textContent = `+${monthData.monthTotalWords}`;
    if (pnlWinrate) pnlWinrate.textContent = `${monthData.winRate}%`;
    if (pnlActiveDays) pnlActiveDays.textContent = `${monthData.activeDaysCount}/${monthData.elapsedDays} ngày học`;
    if (pnlStreak) pnlStreak.textContent = `${monthData.maxStreakInMonth} ngày`;

    const hours = Math.floor(monthData.monthTotalMinutes / 60);
    const mins = monthData.monthTotalMinutes % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}p` : `${mins}p`;
    if (pnlTime) pnlTime.textContent = timeStr;
    if (pnlRetention) pnlRetention.textContent = `Độ nhớ: ${monthData.avgRetention}%`;

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
      let selectedDayObj = null;

      monthData.days.forEach(dayObj => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `calendar-day-cell heat-${dayObj.heatLevel} ${dayObj.isToday ? 'is-today' : ''} ${dayObj.isFuture ? 'is-future' : ''} ${dayObj.dateKey === _selectedDateKey ? 'is-selected' : ''}`;
        cell.dataset.dateKey = dayObj.dateKey;

        if (dayObj.dateKey === _selectedDateKey) {
          selectedDayObj = dayObj;
        }

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

        cell.onclick = () => {
          _selectedDateKey = dayObj.dateKey;
          container.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('is-selected'));
          cell.classList.add('is-selected');
          updateDayInspector(container, dayObj);
        };

        frag.appendChild(cell);
      });

      grid.appendChild(frag);

      // Cập nhật Inspector ban đầu
      if (!selectedDayObj && monthData.days.length > 0) {
        selectedDayObj = monthData.days.find(d => d.isToday) || monthData.days[0];
        _selectedDateKey = selectedDayObj.dateKey;
      }
      if (selectedDayObj) {
        updateDayInspector(container, selectedDayObj);
      }
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
    console.error('Lỗi khi hiển thị tab Thống Kê Trader:', err);
  }
}

function updateDayInspector(container, dayObj) {
  if (!container || !dayObj) return;
  const title = container.querySelector('#journal-inspector-title');
  const subtitle = container.querySelector('#journal-inspector-subtitle');
  const dayNew = container.querySelector('#day-new-val');
  const dayReview = container.querySelector('#day-review-val');
  const dayRetention = container.querySelector('#day-retention-val');
  const dayTime = container.querySelector('#day-time-val');

  if (title) {
    const parts = dayObj.dateKey.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    title.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      CHI TIẾT: NGÀY ${formatted} ${dayObj.isToday ? '(HÔM NAY)' : ''}
    `;
  }

  if (subtitle) {
    if (dayObj.count > 0) {
      subtitle.textContent = `Đã tích lũy thành công ${dayObj.count} từ vựng trong ngày`;
    } else if (dayObj.isFuture) {
      subtitle.textContent = 'Ngày tương lai chưa đến';
    } else {
      subtitle.textContent = 'Chưa có hoạt động học tập trong ngày này';
    }
  }

  if (dayNew) dayNew.textContent = `+${dayObj.newCount} từ`;
  if (dayReview) dayReview.textContent = `${dayObj.reviewCount} từ`;
  if (dayRetention) dayRetention.textContent = `${dayObj.retention}%`;
  if (dayTime) dayTime.textContent = `${dayObj.minutes} phút`;
}
